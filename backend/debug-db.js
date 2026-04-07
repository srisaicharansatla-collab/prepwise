import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const comprehensiveTest = async () => {
  console.log('🔍 Comprehensive MongoDB Connection Diagnostics\n');

  const uri = process.env.MONGO_URI;
  console.log('📋 Connection Details:');
  console.log('URI:', uri.replace(/:([^:@]{4})[^:@]*@/, ':$1****@'));
  console.log('');

  // Test 1: DNS Resolution
  console.log('1️⃣ Testing DNS Resolution...');
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolveSrv('_mongodb._tcp.cluster0.ynfdc4n.mongodb.net', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log('✅ DNS Resolution: SUCCESS');
    console.log('   SRV Records found:', addresses.length);
  } catch (error) {
    console.log('❌ DNS Resolution: FAILED');
    console.log('   Error:', error.message);
  }
  console.log('');

  // Test 2: Basic Network Connectivity
  console.log('2️⃣ Testing Network Connectivity...');
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    console.log('✅ Network Connectivity: SUCCESS');
    await client.close();
  } catch (error) {
    console.log('❌ Network Connectivity: FAILED');
    console.log('   Error:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('   💡 Issue: Wrong username/password');
    } else if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.log('   💡 Issue: IP not whitelisted in MongoDB Atlas');
      console.log('   🔧 Solution: Add your IP to Network Access in Atlas');
    }
  }
  console.log('');

  // Test 3: Mongoose Connection
  console.log('3️⃣ Testing Mongoose Connection...');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Mongoose Connection: SUCCESS');
    console.log('   Host:', conn.connection.host);
    console.log('   Database:', conn.connection.name);
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ Mongoose Connection: FAILED');
    console.log('   Error:', error.message);
  }
  console.log('');

  // Recommendations
  console.log('📝 RECOMMENDATIONS:');
  console.log('1. Add your IP (103.248.208.100) to MongoDB Atlas Network Access');
  console.log('2. Verify cluster is running (not paused)');
  console.log('3. Check database user permissions');
  console.log('4. Try connecting from a different network');
  console.log('5. Temporarily allow all IPs (0.0.0.0/0) for testing');
};

// Run the test
comprehensiveTest().catch(console.error);