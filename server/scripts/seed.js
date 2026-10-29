require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const RoomType = require('../models/RoomType');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { calculateBookingPricing } = require('../utils/currency');

// Verified hospitality image URLs from Unsplash CDN
const HOTEL_IMAGES = {
  indore: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
  ],
  bhopal: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
  ],
  mumbai: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'
  ],
  pune: [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
  ],
  delhi: [
    'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
  ],
  jaipur: [
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'
  ],
  udaipur: [
    'https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
  ],
  goa: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
  ],
  bengaluru: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
  ],
  hyderabad: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
  ],
  chennai: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
  ],
  kolkata: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80'
  ],
  varanasi: [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80'
  ],
  agra: [
    'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
  ],
  kochi: [
    'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'
  ],
  shimla: [
    'https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
  ],
  manali: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
  ],
  rishikesh: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
  ]
};

// Raw hotel demonstration seed catalog (20 properties across 18 Indian cities)
const HOTELS_DATA = [
  {
    name: 'Central Comfort Inn',
    tagline: 'Heart of Indore with authentic Malwa hospitality',
    city: 'Indore',
    state: 'Madhya Pradesh',
    locality: 'Vijay Nagar',
    address: 'Scheme No. 54, Near Meghdoot Garden, Vijay Nagar',
    pinCode: '452010',
    starCategory: 4,
    hotelType: 'business',
    startingPricePaise: 249900,
    isFeatured: true,
    description: 'Experience refined comfort at Central Comfort Inn, situated strategically in the vibrant commercial hub of Vijay Nagar, Indore. Enjoy fast connectivity to Super Corridor, premium business facilities, and delectable Sarafa-inspired evening dining.',
    amenities: ['Free Wi-Fi', 'Swimming Pool', 'Fitness Center', 'Multi-cuisine Restaurant', 'Airport Shuttle', 'Power Backup', 'Air Conditioning', 'Business Center'],
    images: HOTEL_IMAGES.indore
  },
  {
    name: 'Sarafa Heritage Manor',
    tagline: 'Step into royal Holkar heritage in old Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    locality: 'Rajwada',
    address: '14 MG Road, Near Historic Rajwada Palace',
    pinCode: '452002',
    starCategory: 3,
    hotelType: 'heritage',
    startingPricePaise: 179900,
    isFeatured: false,
    description: 'Located minutes away from the iconic Rajwada and the world-famous Sarafa night food bazaar, this hotel combines classic architectural touches with modern guest conveniences.',
    amenities: ['Free Wi-Fi', '24/7 Room Service', 'Complimentary Breakfast', 'Travel Desk', 'Air Conditioning'],
    images: HOTEL_IMAGES.indore
  },
  {
    name: 'Lakeview Residency Bhopal',
    tagline: 'Panoramic vistas overlooking Bhopal’s serene Upper Lake',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    locality: 'Shamla Hills',
    address: 'Shamla Hills, VIP Road, Overlooking Upper Lake',
    pinCode: '462002',
    starCategory: 4,
    hotelType: 'standard',
    startingPricePaise: 289900,
    isFeatured: true,
    description: 'Perched atop picturesque Shamla Hills, Lakeview Residency offers breathless sunset views over the historic Upper Lake (Bada Talab). Features lush landscaped gardens and tranquil lake-facing rooms.',
    amenities: ['Lake View Balcony', 'Free Wi-Fi', 'Garden Restaurant', 'Free Parking', 'Room Service', 'Air Conditioning'],
    images: HOTEL_IMAGES.bhopal
  },
  {
    name: 'Urban Nest Suites Mumbai',
    tagline: 'Modern luxury living in Mumbai’s bustling financial center',
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: 'Bandra Kurla Complex (BKC)',
    address: 'G Block, Bandra Kurla Complex, Bandra East',
    pinCode: '400051',
    starCategory: 5,
    hotelType: 'luxury',
    startingPricePaise: 849900,
    isFeatured: true,
    description: 'A sanctuary of urban sophistication in the heart of Mumbai’s BKC. Crafted for discerning business executives and leisure connoisseurs seeking flawless service, infinity pools, and world-class culinary experiences.',
    amenities: ['Infinity Pool', 'Luxury Spa', '24h Gym', 'Fine Dining', 'Valet Parking', 'High-speed Wi-Fi', 'Concierge Service'],
    images: HOTEL_IMAGES.mumbai
  },
  {
    name: 'Marine Breeze Hotel',
    tagline: 'Wake up to the Arabian Sea at Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    locality: 'Marine Drive',
    address: '84 Marine Drive, South Mumbai',
    pinCode: '400020',
    starCategory: 4,
    hotelType: 'boutique',
    startingPricePaise: 620000,
    isFeatured: false,
    description: 'Nestled along Mumbai’s famed Queen’s Necklace, Marine Breeze provides iconic oceanfront vistas, vintage art-deco architecture, and intimate luxury.',
    amenities: ['Sea View Rooms', 'Rooftop Lounge', 'Free Wi-Fi', 'Airport Transfers', 'Complimentary Breakfast'],
    images: HOTEL_IMAGES.mumbai
  },
  {
    name: 'Deccan Heritage Suites Pune',
    tagline: 'Tranquil luxury amidst Koregaon Park greens',
    city: 'Pune',
    state: 'Maharashtra',
    locality: 'Koregaon Park',
    address: 'Lane 7, Koregaon Park',
    pinCode: '411001',
    starCategory: 4,
    hotelType: 'boutique',
    startingPricePaise: 349900,
    isFeatured: false,
    description: 'Situated in the greenest enclave of Pune, Deccan Heritage Suites features serene courtyard dining, art galleries, and proximity to Osho Garden and top cafes.',
    amenities: ['Free Wi-Fi', 'Courtyard Cafe', 'Spa', 'Pet Friendly', 'Air Conditioning', 'Free Parking'],
    images: HOTEL_IMAGES.pune
  },
  {
    name: 'The Imperial Grand New Delhi',
    tagline: 'Timeless colonial grandeur in the capital city',
    city: 'Delhi',
    state: 'Delhi',
    locality: 'Connaught Place',
    address: 'Janpath, Connaught Place',
    pinCode: '110001',
    starCategory: 5,
    hotelType: 'luxury',
    startingPricePaise: 950000,
    isFeatured: true,
    description: 'An iconic heritage landmark celebrating India’s history and art. Located moments from Connaught Place, featuring award-winning pan-Asian and North Indian royal restaurants.',
    amenities: ['Outdoor Pool', 'Royal Spa', 'Art Gallery', 'Multiple Restaurants', 'Chauffeur Service', 'High-speed Wi-Fi'],
    images: HOTEL_IMAGES.delhi
  },
  {
    name: 'Pink City Heritage Stay Jaipur',
    tagline: 'Live like royals with Rajputana hospitality',
    city: 'Jaipur',
    state: 'Rajasthan',
    locality: 'Civil Lines',
    address: 'Jacob Road, Civil Lines',
    pinCode: '302006',
    starCategory: 4,
    hotelType: 'heritage',
    startingPricePaise: 420000,
    isFeatured: true,
    description: 'Adorned with intricate Rajasthani frescoes, jharokha balconies, and sprawling gardens, Pink City Heritage Stay offers an authentic slice of royal Rajputana life with evening folk music.',
    amenities: ['Swimming Pool', 'Folk Dance Evenings', 'Rajasthani Thali Dining', 'Free Wi-Fi', 'Travel Desk'],
    images: HOTEL_IMAGES.jaipur
  },
  {
    name: 'Lake Pichola Palace Hotel Udaipur',
    tagline: 'Romance on the shimmering waters of Pichola',
    city: 'Udaipur',
    state: 'Rajasthan',
    locality: 'Lake Pichola',
    address: 'Ambrai Ghat Road, Old City',
    pinCode: '313001',
    starCategory: 5,
    hotelType: 'luxury',
    startingPricePaise: 1150000,
    isFeatured: true,
    description: 'Overlooking the City Palace and Lake Pichola, this majestic palace hotel offers candlelit rooftop dinners, traditional boat rides, and unmatched romantic charm.',
    amenities: ['Lake View', 'Rooftop Dining', 'Ayurvedic Spa', 'Swimming Pool', 'Boat Rides', 'Valet Parking'],
    images: HOTEL_IMAGES.udaipur
  },
  {
    name: 'Coastal Breeze Beach Resort Goa',
    tagline: 'Sun, sand, and tropical bliss in North Goa',
    city: 'Goa',
    state: 'Goa',
    locality: 'Candolim',
    address: 'Fort Aguada Road, Candolim Beach',
    pinCode: '403515',
    starCategory: 4,
    hotelType: 'resort',
    startingPricePaise: 480000,
    isFeatured: true,
    description: 'Steps away from Candolim beach, Coastal Breeze is an idyllic tropical escape with private beach cabanas, lagoon-style pools, and authentic Goan seafood cuisine.',
    amenities: ['Beach Access', 'Lagoon Pool', 'Beach Bar & Grill', 'Free Wi-Fi', 'Live Music', 'Water Sports Desk'],
    images: HOTEL_IMAGES.goa
  },
  {
    name: 'Garden City Business Hotel Bengaluru',
    tagline: 'Smart tech, lush gardens, and seamless connectivity',
    city: 'Bengaluru',
    state: 'Karnataka',
    locality: 'Whitefield',
    address: 'ITPL Main Road, Whitefield',
    pinCode: '560066',
    starCategory: 4,
    hotelType: 'business',
    startingPricePaise: 389900,
    isFeatured: false,
    description: 'Designed specifically for tech professionals and business travelers in Bengaluru’s silicon corridor, offering high-speed fiber internet, ergonomic workstations, and craft microbreweries nearby.',
    amenities: ['High-speed Fiber Wi-Fi', 'Ergonomic Workstations', 'Gym & Sauna', 'Conference Rooms', 'Craft Bar'],
    images: HOTEL_IMAGES.bengaluru
  },
  {
    name: 'Nizam Serai Suites Hyderabad',
    tagline: 'Modern luxury honoring the City of Pearls',
    city: 'Hyderabad',
    state: 'Telangana',
    locality: 'Banjara Hills',
    address: 'Road No. 1, Banjara Hills',
    pinCode: '500034',
    starCategory: 4,
    hotelType: 'standard',
    startingPricePaise: 360000,
    isFeatured: false,
    description: 'Experience genuine Hyderabadi warmth in Banjara Hills, featuring authentic Dum Biryani dining, grand banquet facilities, and seamless access to HITEC City.',
    amenities: ['Swimming Pool', 'Biryani Specialty Restaurant', 'Gym', 'Free Wi-Fi', 'Free Valet Parking'],
    images: HOTEL_IMAGES.hyderabad
  },
  {
    name: 'Marina Grand Hotel Chennai',
    tagline: 'Coastal charm in the cultural capital of the South',
    city: 'Chennai',
    state: 'Tamil Nadu',
    locality: 'Mylapore',
    address: 'Radhakrishnan Salai, Near Marina Beach, Mylapore',
    pinCode: '600004',
    starCategory: 4,
    hotelType: 'standard',
    startingPricePaise: 310000,
    isFeatured: false,
    description: 'Immerse yourself in Chennai’s classical art and culinary traditions. Located minutes from San Thome Cathedral, Kapaleeshwarar Temple, and the world’s second-longest urban beach.',
    amenities: ['South Indian Filter Coffee Cafe', 'Free Wi-Fi', 'Swimming Pool', 'Spa', 'Airport Shuttle'],
    images: HOTEL_IMAGES.chennai
  },
  {
    name: 'Howrah Gateway Residency Kolkata',
    tagline: 'The City of Joy’s premier warm hospitality',
    city: 'Kolkata',
    state: 'West Bengal',
    locality: 'Park Street',
    address: 'Park Street, Next to Camac Street',
    pinCode: '700016',
    starCategory: 4,
    hotelType: 'standard',
    startingPricePaise: 299900,
    isFeatured: false,
    description: 'Situated on Kolkata’s most famous boulevard, Park Street. Enjoy colonial charm, legendary Bengali sweets, and effortless walking access to Victoria Memorial.',
    amenities: ['Free Wi-Fi', 'Bengali & Continental Cuisine', 'Bar & Lounge', '24/7 Room Service'],
    images: HOTEL_IMAGES.kolkata
  },
  {
    name: 'Ganges View Residency Varanasi',
    tagline: 'Spiritual tranquility overlooking the sacred Ganga Ghats',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    locality: 'Assi Ghat',
    address: 'Assi Ghat Road, Bhelupur',
    pinCode: '221005',
    starCategory: 3,
    hotelType: 'heritage',
    startingPricePaise: 220000,
    isFeatured: true,
    description: 'A serene haven near Assi Ghat where mornings greet you with temple chimes and peaceful river breezes. Rooftop yoga sessions and special Ganga Aarti boat excursions arranged daily.',
    amenities: ['Ganga River View', 'Rooftop Yoga', 'Pure Vegetarian Restaurant', 'Free Wi-Fi', 'Aarti Boat Assistance'],
    images: HOTEL_IMAGES.varanasi
  },
  {
    name: 'Taj View Crown Stay Agra',
    tagline: 'Unobstructed vistas of the monumental Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    locality: 'Tajganj',
    address: 'Fatehabad Road, Tajganj',
    pinCode: '282001',
    starCategory: 4,
    hotelType: 'standard',
    startingPricePaise: 350000,
    isFeatured: false,
    description: 'Located only 1 kilometer from the East Gate of the Taj Mahal. Offering breathtaking rooftop views of the marble mausoleum at dawn and dusk.',
    amenities: ['Rooftop Taj View Cafe', 'Swimming Pool', 'Mughlai Dining', 'Free Wi-Fi', 'Airport Shuttle'],
    images: HOTEL_IMAGES.agra
  },
  {
    name: 'Malabar Harbour Retreat Kochi',
    tagline: 'Spices, heritage, and serene backwaters of Kerala',
    city: 'Kochi',
    state: 'Kerala',
    locality: 'Fort Kochi',
    address: 'Tower Road, Fort Kochi',
    pinCode: '682001',
    starCategory: 4,
    hotelType: 'boutique',
    startingPricePaise: 390000,
    isFeatured: false,
    description: 'A restored Dutch-Portuguese colonial manor in Fort Kochi with lush courtyard palms, Ayurvedic massages, and fresh Malabar seafood.',
    amenities: ['Ayurvedic Wellness Spa', 'Backwater Tours', 'Free Wi-Fi', 'Seafood Specialty Dining', 'Bicycle Rentals'],
    images: HOTEL_IMAGES.kochi
  },
  {
    name: 'Cedar Ridge Pine Lodge Shimla',
    tagline: 'Colonial hill charm amidst cedar and pine slopes',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    locality: 'The Mall',
    address: 'Near Ridge, The Mall Road',
    pinCode: '171001',
    starCategory: 4,
    hotelType: 'resort',
    startingPricePaise: 420000,
    isFeatured: false,
    description: 'Step into cozy wooden interiors and crackling fireplaces right off Shimla’s famous Mall Road. Stunning Himalayan snow-peak views from every private balcony.',
    amenities: ['Fireplace Suites', 'Himalayan View Balconies', 'Heated Rooms', 'Free Wi-Fi', 'Cafe & Bakery'],
    images: HOTEL_IMAGES.shimla
  },
  {
    name: 'Mountain Haven Lodge Manali',
    tagline: 'Snow-capped tranquility in the heart of Old Manali',
    city: 'Manali',
    state: 'Himachal Pradesh',
    locality: 'Old Manali',
    address: 'Club House Road, Old Manali',
    pinCode: '175131',
    starCategory: 3,
    hotelType: 'budget',
    startingPricePaise: 189900,
    isFeatured: true,
    description: 'Surrounded by deodar forests and apple orchards, Mountain Haven Lodge is the ideal basecamp for Solang Valley adventure, Rohtang trips, and peaceful mountain stays.',
    amenities: ['Mountain View Balcony', 'Bonfire Evenings', 'Trek Assistance', 'Free Wi-Fi', 'Cafe with Live Music'],
    images: HOTEL_IMAGES.manali
  },
  {
    name: 'Ananda Divine Retreat Rishikesh',
    tagline: 'Soulful rejuvenation on the banks of holy river Ganges',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    locality: 'Tapovan',
    address: 'Badrinath Road, Tapovan',
    pinCode: '249192',
    starCategory: 4,
    hotelType: 'resort',
    startingPricePaise: 320000,
    isFeatured: false,
    description: 'An idyllic wellness sanctuary in Tapovan, Rishikesh. Featuring daily guided meditation sessions, organic sattvic food, Ganga beach walks, and river rafting packages.',
    amenities: ['Yoga & Meditation Shala', 'Sattvic Organic Cafe', 'Ganga Beach Access', 'Free Wi-Fi', 'Adventure Desk'],
    images: HOTEL_IMAGES.rishikesh
  }
];

// Seed function
async function seedDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[StaySphere Seed] Initializing database connection...');
      await connectDB();
    }

    console.log('[StaySphere Seed] Clearing existing demonstration collections...');
    await Promise.all([
      User.deleteMany({}),
      Hotel.deleteMany({}),
      RoomType.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Review.deleteMany({})
    ]);

    console.log('[StaySphere Seed] Creating default test users...');
    const guestUser = await User.create({
      name: 'Rohan Sharma',
      email: 'guest@staysphere.com',
      phone: '9876543210',
      password: 'Guest@123',
      role: 'guest',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
      accountStatus: 'active'
    });

    const managerUser = await User.create({
      name: 'Priya Verma',
      email: 'manager@staysphere.com',
      phone: '9826012345',
      password: 'Manager@123',
      role: 'manager',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pinCode: '452010',
      accountStatus: 'active'
    });

    const adminUser = await User.create({
      name: 'StaySphere Administrator',
      email: 'admin@staysphere.com',
      phone: '9893011223',
      password: 'Admin@123',
      role: 'admin',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      pinCode: '462002',
      accountStatus: 'active'
    });

    console.log('[StaySphere Seed] Seeding 20 demonstration hotels across India...');
    const createdHotels = [];

    for (let i = 0; i < HOTELS_DATA.length; i++) {
      const hData = HOTELS_DATA[i];
      // Assign the first 3 hotels to our demo manager
      const isManagedByDemo = i < 3;
      const hotel = await Hotel.create({
        ...hData,
        featuredImage: hData.images[0],
        managers: isManagedByDemo ? [managerUser._id] : [],
        approvalStatus: 'approved',
        isActive: true,
        averageRating: 4.3 + (i % 6) * 0.1,
        reviewCount: 15 + (i * 7)
      });

      if (isManagedByDemo) {
        managerUser.managedHotels.push(hotel._id);
      }

      // Seed 2-3 realistic room types per hotel
      const basePrice = hData.startingPricePaise;

      const deluxeRoom = await RoomType.create({
        hotel: hotel._id,
        name: 'Deluxe City Room',
        description: 'Spacious and tastefully furnished with modern amenities, plush king bed, and complimentary high-speed Wi-Fi.',
        capacity: { adults: 2, children: 1, maxGuests: 3 },
        bedConfiguration: '1 King Bed',
        roomSizeSqFt: 280,
        totalInventory: 8,
        pricePerNightPaise: basePrice,
        amenities: ['Air Conditioning', 'Free High-speed Wi-Fi', 'Smart TV', 'Tea & Coffee Maker', 'Attached Bathroom with Geyser'],
        images: [hData.images[0], hData.images[1] || hData.images[0]],
        breakfastIncluded: false,
        freeCancellation: true,
        isActive: true
      });

      const executiveRoom = await RoomType.create({
        hotel: hotel._id,
        name: 'Executive Balcony Suite',
        description: 'Premium suite featuring a panoramic private balcony, premium bedding, work desk, and complimentary breakfast buffet.',
        capacity: { adults: 3, children: 1, maxGuests: 4 },
        bedConfiguration: '1 King Bed + 1 Daybed',
        roomSizeSqFt: 420,
        totalInventory: 5,
        pricePerNightPaise: Math.round(basePrice * 1.45),
        amenities: ['Private Balcony', 'Complimentary Breakfast', 'Mini Bar', 'Bathtub', 'Workstation', 'Air Conditioning'],
        images: [hData.images[1] || hData.images[0], hData.images[0]],
        breakfastIncluded: true,
        freeCancellation: true,
        isActive: true
      });

      createdHotels.push({ hotel, rooms: [deluxeRoom, executiveRoom] });
    }

    await managerUser.save();

    console.log('[StaySphere Seed] Seeding demonstration bookings and reviews for demo guest...');
    // Seed 1 upcoming booking and 1 completed past booking for demo guest
    const targetHotelEntry = createdHotels[0];
    const indoreHotel = targetHotelEntry.hotel;
    const indoreRoom = targetHotelEntry.rooms[0];

    // Upcoming booking (Check-in 3 days from now)
    const upcomingCheckIn = new Date();
    upcomingCheckIn.setDate(upcomingCheckIn.getDate() + 3);
    const upcomingCheckOut = new Date();
    upcomingCheckOut.setDate(upcomingCheckOut.getDate() + 5);

    const pricing1 = calculateBookingPricing({
      pricePerNightPaise: indoreRoom.pricePerNightPaise,
      numberOfNights: 2,
      numberOfRooms: 1,
      taxRatePercent: 12
    });

    const upcomingBooking = await Booking.create({
      bookingReference: 'SS-IN-DEMO-UP10',
      guest: guestUser._id,
      hotel: indoreHotel._id,
      roomType: indoreRoom._id,
      checkInDate: upcomingCheckIn,
      checkOutDate: upcomingCheckOut,
      numberOfNights: 2,
      numberOfRooms: 1,
      numberOfGuests: { adults: 2, children: 0 },
      guestDetails: {
        fullName: 'Rohan Sharma',
        email: 'guest@staysphere.com',
        phone: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pinCode: '452010',
        specialRequests: 'High floor room if possible'
      },
      pricing: pricing1,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid'
    });

    const payment1 = await Payment.create({
      booking: upcomingBooking._id,
      bookingReference: upcomingBooking.bookingReference,
      amountPaise: pricing1.totalAmountPaise,
      currency: 'INR',
      paymentProvider: 'demo',
      providerOrderId: 'DEMO_ORD_101',
      providerPaymentId: 'DEMO_TXN_UPI_98765',
      paymentStatus: 'success',
      paymentMethod: 'UPI — GooglePay / PhonePe (Simulated Demo)',
      isSimulated: true,
      paidAt: new Date()
    });

    upcomingBooking.payment = payment1._id;
    await upcomingBooking.save();

    // Past completed booking (10 days ago) for guest review eligibility
    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 12);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 10);

    const pricing2 = calculateBookingPricing({
      pricePerNightPaise: indoreRoom.pricePerNightPaise,
      numberOfNights: 2,
      numberOfRooms: 1,
      taxRatePercent: 12
    });

    const pastBooking = await Booking.create({
      bookingReference: 'SS-IN-DEMO-PAST',
      guest: guestUser._id,
      hotel: indoreHotel._id,
      roomType: indoreRoom._id,
      checkInDate: pastCheckIn,
      checkOutDate: pastCheckOut,
      numberOfNights: 2,
      numberOfRooms: 1,
      numberOfGuests: { adults: 2, children: 0 },
      guestDetails: {
        fullName: 'Rohan Sharma',
        email: 'guest@staysphere.com',
        phone: '9876543210',
        city: 'Indore',
        state: 'Madhya Pradesh',
        pinCode: '452010'
      },
      pricing: pricing2,
      bookingStatus: 'checked_out',
      paymentStatus: 'paid',
      hasReviewed: true
    });

    const payment2 = await Payment.create({
      booking: pastBooking._id,
      bookingReference: pastBooking.bookingReference,
      amountPaise: pricing2.totalAmountPaise,
      currency: 'INR',
      paymentProvider: 'demo',
      providerOrderId: 'DEMO_ORD_102',
      providerPaymentId: 'DEMO_TXN_CARD_12345',
      paymentStatus: 'success',
      paymentMethod: 'RuPay / Visa Debit Card (Simulated Demo)',
      isSimulated: true,
      paidAt: pastCheckIn
    });

    pastBooking.payment = payment2._id;
    await pastBooking.save();

    // Seed verified review for this completed stay
    await Review.create({
      guest: guestUser._id,
      guestName: guestUser.name,
      hotel: indoreHotel._id,
      booking: pastBooking._id,
      rating: 5,
      title: 'Flawless stay in Vijay Nagar!',
      comment: 'The location was perfect, right near Meghdoot Garden. The staff was courteous, room was sparkling clean, and breakfast buffet had delicious poha and jalebi. Will definitely stay here again on my next trip to Indore.',
      isVerifiedStay: true,
      isDemo: true,
      moderationStatus: 'approved'
    });

    console.log('================================================================');
    console.log('✅ StaySphere database seeded successfully!');
    console.log(`🏨 Total Hotels: ${createdHotels.length} across 18 Indian cities`);
    console.log('👥 Demo Accounts created:');
    console.log('   1. Guest:        guest@staysphere.com    / Guest@123');
    console.log('   2. Hotel Manager:manager@staysphere.com  / Manager@123');
    console.log('   3. Administrator:admin@staysphere.com    / Admin@123');
    console.log('================================================================');

    if (require.main === module) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error(`[StaySphere Seed Error] Failed to seed: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
