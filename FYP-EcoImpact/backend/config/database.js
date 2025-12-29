const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists in environment variables
    const mongoURI = process.env.MONGO_URI;
    
    console.log('📋 Checking MongoDB connection configuration...');
    console.log(`   MONGO_URI exists: ${mongoURI ? 'true' : 'false'}`);
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables. Please check your .env file in the backend root directory.');
    }

    // Log connection attempt (without password)
    const uriWithoutPassword = mongoURI.replace(/:[^:@]+@/, ':*****@');
    console.log(`🔄 Connecting to MongoDB Atlas: ${uriWithoutPassword}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Atlas Connected Successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
    
    return conn;
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Full error: ${error}`);
    console.error('');
    console.error('💡 Troubleshooting steps:');
    console.error('   1. Check your MONGO_URI in .env file (backend root directory)');
    console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('   3. Verify your username and password are correct');
    console.error('   4. Check if your MongoDB Atlas cluster is running');
    console.error('');
    throw error; // Re-throw to prevent server from starting
  }
};

module.exports = connectDB;

