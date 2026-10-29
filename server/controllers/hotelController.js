const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Review = require('../models/Review');

/**
 * List & Search hotels with filters, sorting, and pagination
 * GET /api/hotels
 */
async function getHotels(req, res, next) {
  try {
    const {
      city,
      search,
      minPrice,
      maxPrice,
      starCategory,
      hotelType,
      amenities,
      sort = 'recommended',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {
      isActive: true,
      approvalStatus: 'approved'
    };

    // City filter
    if (city && city.trim() !== '' && city.toLowerCase() !== 'all') {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    // Keyword search (hotel name, city, locality)
    if (search && search.trim() !== '') {
      const keywordRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: keywordRegex },
        { city: keywordRegex },
        { locality: keywordRegex },
        { description: keywordRegex }
      ];
    }

    // Star category filter (single or comma-separated e.g. "3,4,5")
    if (starCategory) {
      const stars = starCategory.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
      if (stars.length > 0) {
        filter.starCategory = { $in: stars };
      }
    }

    // Hotel type filter
    if (hotelType && hotelType !== 'all') {
      const types = hotelType.split(',').map((t) => t.trim().toLowerCase());
      filter.hotelType = { $in: types };
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',').map((a) => a.trim());
      filter.amenities = { $all: amenityList };
    }

    // Price filtering (on startingPricePaise)
    if (minPrice || maxPrice) {
      filter.startingPricePaise = {};
      if (minPrice) {
        // minPrice in rupees converted to paise
        filter.startingPricePaise.$gte = parseInt(minPrice, 10) * 100;
      }
      if (maxPrice) {
        filter.startingPricePaise.$lte = parseInt(maxPrice, 10) * 100;
      }
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'price_asc') {
      sortOptions = { startingPricePaise: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { startingPricePaise: -1 };
    } else if (sort === 'rating') {
      sortOptions = { averageRating: -1, reviewCount: -1 };
    } else if (sort === 'popular') {
      sortOptions = { reviewCount: -1, averageRating: -1 };
    } else {
      // Default: featured first, then highest rated
      sortOptions = { isFeatured: -1, averageRating: -1, createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [hotels, totalHotels] = await Promise.all([
      Hotel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('managers', 'name email'),
      Hotel.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalHotels / limitNum);

    res.status(200).json({
      success: true,
      message: 'Hotels retrieved successfully',
      data: {
        hotels,
        pagination: {
          totalHotels,
          totalPages,
          currentPage: pageNum,
          limit: limitNum,
          hasPrevPage: pageNum > 1,
          hasNextPage: pageNum < totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get featured hotels for home page
 * GET /api/hotels/featured
 */
async function getFeaturedHotels(req, res, next) {
  try {
    const hotels = await Hotel.find({
      isActive: true,
      approvalStatus: 'approved',
      isFeatured: true
    })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Indian destinations metadata with hotel counts
 * GET /api/hotels/destinations
 */
async function getDestinations(req, res, next) {
  try {
    const destinationStats = await Hotel.aggregate([
      { $match: { isActive: true, approvalStatus: 'approved' } },
      {
        $group: {
          _id: '$city',
          state: { $first: '$state' },
          hotelCount: { $sum: 1 },
          sampleImage: { $first: '$featuredImage' },
          startingPricePaise: { $min: '$startingPricePaise' },
          averageRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { hotelCount: -1, _id: 1 } }
    ]);

    const destinations = destinationStats.map((dest) => ({
      city: dest._id,
      state: dest.state,
      hotelCount: dest.hotelCount,
      image: dest.sampleImage,
      startingPricePaise: dest.startingPricePaise || 149900,
      averageRating: Math.round((dest.averageRating || 4.2) * 10) / 10
    }));

    res.status(200).json({
      success: true,
      data: { destinations }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single hotel details by slug or ObjectId
 * GET /api/hotels/:identifier
 */
async function getHotelDetails(req, res, next) {
  try {
    const { identifier } = req.params;

    const isMongoId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isMongoId ? { _id: identifier } : { slug: identifier };

    const hotel = await Hotel.findOne(query).populate('managers', 'name email phone');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found.'
      });
    }

    // Fetch active room types for this hotel
    const roomTypes = await RoomType.find({ hotel: hotel._id, isActive: true }).sort({
      pricePerNightPaise: 1
    });

    // Fetch latest verified approved reviews
    const reviews = await Review.find({ hotel: hotel._id, moderationStatus: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('guest', 'name avatar');

    res.status(200).json({
      success: true,
      data: {
        hotel,
        roomTypes,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new hotel (Manager or Admin)
 * POST /api/hotels
 */
async function createHotel(req, res, next) {
  try {
    const {
      name,
      tagline,
      description,
      starCategory,
      hotelType,
      address,
      locality,
      city,
      state,
      pinCode,
      coordinates,
      images,
      featuredImage,
      amenities,
      policies,
      contactPhone,
      contactEmail,
      startingPricePaise
    } = req.body;

    const managerId = req.user.role === 'manager' ? [req.user._id] : req.body.managers || [];

    const hotel = await Hotel.create({
      name,
      tagline,
      description,
      starCategory: parseInt(starCategory, 10) || 3,
      hotelType: hotelType || 'standard',
      address,
      locality,
      city,
      state,
      pinCode,
      coordinates,
      images: images || [],
      featuredImage: featuredImage || (images && images[0]) || '',
      amenities: amenities || [],
      policies: policies || {},
      contactPhone,
      contactEmail,
      startingPricePaise: startingPricePaise || 199900,
      managers: managerId,
      approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending',
      isActive: true
    });

    // If manager created it, associate hotel with manager user record
    if (req.user.role === 'manager') {
      req.user.managedHotels.push(hotel._id);
      await req.user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Hotel listing created successfully.',
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update hotel
 * PUT /api/hotels/:id
 */
async function updateHotel(req, res, next) {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    // Authorization check
    if (req.user.role !== 'admin') {
      const isManager = hotel.managers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isManager) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this hotel.'
        });
      }
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Hotel details updated successfully.',
      data: { hotel: updatedHotel }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle hotel active state
 * PATCH /api/hotels/:id/status
 */
async function toggleHotelStatus(req, res, next) {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    if (req.user.role !== 'admin') {
      const isManager = hotel.managers.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isManager) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized.'
        });
      }
    }

    hotel.isActive = !hotel.isActive;
    await hotel.save();

    res.status(200).json({
      success: true,
      message: `Hotel is now ${hotel.isActive ? 'active' : 'inactive'}.`,
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHotels,
  getFeaturedHotels,
  getDestinations,
  getHotelDetails,
  createHotel,
  updateHotel,
  toggleHotelStatus
};
