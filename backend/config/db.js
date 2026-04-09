import mongoose from 'mongoose';
import dns from 'dns';

// Force Google DNS — the system/ISP DNS blocks SRV queries needed by mongodb+srv
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, avoids DNS SRV IPv6 issues
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Tip: Make sure your IP is whitelisted in MongoDB Atlas Network Access');
    process.exit(1);
  }
};
