const mongoose = require('mongoose');

let memoryServerInstance = null;

/**
 * Connect to MongoDB with graceful fallback
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[StaySphere DB] Connecting to specified MONGODB_URI...`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[StaySphere DB] Connected to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      return;
    } catch (err) {
      console.warn(`[StaySphere DB] Failed to connect to specified MONGODB_URI: ${err.message}`);
      console.warn(`[StaySphere DB] Falling back to embedded MongoMemoryServer for development...`);
    }
  }

  // Fallback to MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServerInstance = await MongoMemoryServer.create();
    const memUri = memoryServerInstance.getUri();
    await mongoose.connect(memUri);
    console.log(`[StaySphere DB] Successfully initialized embedded MongoMemoryServer at: ${memUri}`);
  } catch (memErr) {
    console.error(`[StaySphere DB] Critical: Could not start MongoMemoryServer: ${memErr.message}`);
    throw memErr;
  }
}

/**
 * Disconnect and cleanup database connections (for tests and teardown)
 */
async function disconnectDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    console.log(`[StaySphere DB] Database disconnected.`);
  } catch (err) {
    console.error(`[StaySphere DB] Error during disconnect: ${err.message}`);
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
