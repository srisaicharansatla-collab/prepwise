import express from 'express';
const router = express.Router();

// POST /api/diagnostic/update-user
router.post('/update-user', (req, res) => {
  console.log('📨 INCOMING:', JSON.stringify(req.body, null, 2));
  console.log('👤 HARDCODED USER_ID: 64f8b4a5c8d4e2f8b1234567');
  
  // Your full update logic here...
  res.json({ received: true, body: req.body });
});

export default router;

