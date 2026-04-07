import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1****@')); // Hide password

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed.');

  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('🔍 Possible issues:');
      console.log('  - Incorrect username or password');
      console.log('  - Database user does not exist');
      console.log('  - Database user lacks permissions');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log('🔍 Possible issues:');
      console.log('  - IP address not whitelisted in MongoDB Atlas');
      console.log('  - Network connectivity issues');
      console.log('  - MongoDB cluster is paused or stopped');
      console.log('  - DNS resolution issues');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('🔍 Possible issues:');
      console.log('  - Invalid cluster URL');
      console.log('  - DNS resolution issues');
    }
  }
};

testConnection();