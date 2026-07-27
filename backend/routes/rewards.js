/**
 * routes/rewards.js
 *
 * GET  /api/rewards                    — list redeemable items
 * POST /api/rewards/:rewardId/redeem   — check tokens, deduct, confirm
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// List rewards
router.get('/', async (req, res) => {
  try {
    const snap    = await db.collection('rewards').where('available', '==', true).get();
    const rewards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(rewards);
  } catch (err) {
    console.error('List rewards error:', err);
    return res.status(500).json({ error: 'Failed to list rewards' });
  }
});

// Redeem a reward
// Body: { userId? }  — defaults to authenticated user
router.post('/:rewardId/redeem', async (req, res) => {
  const { rewardId } = req.params;
  const uid          = req.user.uid; // always use the authenticated user

  try {
    const rewardDoc = await db.collection('rewards').doc(rewardId).get();
    if (!rewardDoc.exists) return res.status(404).json({ error: 'Reward not found' });
    const reward = rewardDoc.data();
    if (!reward.available) return res.status(400).json({ error: 'Reward is not available' });

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const user = userDoc.data();

    if ((user.tokens || 0) < reward.cost) {
      return res.status(402).json({
        error:    'Insufficient tokens',
        required: reward.cost,
        current:  user.tokens || 0,
      });
    }

    const batch = db.batch();
    batch.update(userRef, { tokens: (user.tokens || 0) - reward.cost });

    const redemptionRef = db.collection('redemptions').doc();
    batch.set(redemptionRef, {
      userId:      uid,
      rewardId,
      rewardName:  reward.name,
      cost:        reward.cost,
      redeemedAt:  new Date().toISOString(),
    });

    await batch.commit();

    return res.json({
      message:       'Reward redeemed',
      redemptionId:  redemptionRef.id,
      updatedWallet: { tokens: (user.tokens || 0) - reward.cost },
    });
  } catch (err) {
    console.error('Redeem error:', err);
    return res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

module.exports = router;
