import mongoose from 'mongoose';

export const updateStats = async (req, res) => {
  let testConn;
  
  console.log('📨 /api/v1/update-stats RECEIVED:', req.body);
  
  try {
    const testUri = process.env.MONGO_TEST_URI;
    if (!testUri) throw new Error('MONGO_TEST_URI missing from .env');
    
    testConn = mongoose.createConnection(testUri);
    const TestUser = testConn.model('User', require('../models/User').schema);
    
    const user = await TestUser.findById(req.user._id || '64f8b4a5c8d4e2f8b1234567');
    if (!user) return res.status(404).json({error: 'User not found in test DB'});
    
    console.log('👤 USER FOUND:', user.username, 'XP before:', user.totalXP);
    
    // Atomic updates
    user.totalXP += 5;
    user.totalAttempted += 1;
    if (req.body.isCorrect) {
      user.totalCorrect += 1;
    }
    
    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(user.lastActivityDate || 0);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - last) / (1000*60*60*24));
    
    if (diffDays === 1) {
      user.currentStreak += 1;
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    }
    user.lastActivityDate = new Date();
    
    // Accuracy
    user.accuracyRate = parseFloat((user.totalCorrect / user.totalAttempted * 100).toFixed(2));
    
    await user.save();
    
    console.log('💾 DB UPDATED:', {totalXP: user.totalXP, streak: user.currentStreak, accuracy: user.accuracyRate});
    console.log('📤 SENDING RESPONSE');
    
    res.json(user);
    
  } catch (error) {
    console.error('💥 DB ERROR:', error.message);
    res.status(500).json({error: error.message});
  } finally {
    testConn?.close();
  }
};

