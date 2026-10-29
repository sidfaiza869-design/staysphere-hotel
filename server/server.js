require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const Hotel = require('./models/Hotel');
const { seedDatabase } = require('./scripts/seed');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Check if database has hotels; if empty (e.g. fresh MongoMemoryServer), auto-seed demo data
    const hotelCount = await Hotel.countDocuments();
    if (hotelCount === 0) {
      console.log('[StaySphere] Empty database detected. Auto-seeding initial 20 Indian hotels & accounts...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🏨 StaySphere Backend Server running on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Rejection: ${err.message}`);
      // Do not crash server in dev
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });
  } catch (error) {
    console.error(`Failed to start StaySphere server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
