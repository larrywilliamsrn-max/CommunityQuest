/**
 * routes/participant.js
 *
 * All routes that a PARTICIPANT can call after logging in.
 *
 * GET  /api/participant/dashboard        — token balance, badges, recent activity
 * GET  /api/participant/quests           — list available quests
 * POST /api/participant/quests/:id/join  — start / join a quest
 * GET  /api/participant/rewards          — list redeemable rewards
 * POST /api/participant/rewards/:id/redeem — redeem a reward
 * GET  /api/participant/badges           — list earned badges
 * GET  /api/participant/leaderboard      — public leaderboard
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// All participant routes require authentication
router.use(verifyToken);
router.use(requireRole('participant', 'organizer')); // organizers can also call these

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'Profile not found' });

    const user = userDoc.data();

    // Recent participations (last 10)
    const participationsSnap = await db
      .collection('participations')
      .where('userId', '==', req.user.uid)
      .orderBy('completedAt', 'desc')
      .limit(10)
      .get();

    const recentActivity = participationsSnap.docs.map((d) => d.data());

    return res.json({
      uid: user.uid,
      displayName: user.displayName,
      tokens: user.tokens || 0,
      badges: user.badges || [],
      recentActivity,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// ─── List quests ──────────────────────────────────────────────────────────────
router.get('/quests', async (req, res) => {
  try {
    const snap = await db.collection('quests').where('active', '==', true).get();
    const quests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(quests);
  } catch (err) {
    console.error('List quests error:', err);
    return res.status(500).json({ error: 'Failed to list quests' });
  }
});

// ─── Join / start a quest ─────────────────────────────────────────────────────
router.post('/quests/:id/join', async (req, res) => {
  const { id: questId } = req.params;

  try {
    const questDoc = await db.collection('quests').doc(questId).get();
    if (!questDoc.exists) return res.status(404).json({ error: 'Quest not found' });

    const quest = questDoc.data();
    if (!quest.active) return res.status(400).json({ error: 'Quest is not active' });

    // Check if already participating
    const existing = await db
      .collection('participations')
      .where('userId', '==', req.user.uid)
      .where('questId', '==', questId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(409).json({ error: 'Already joined this quest' });
    }

    const participation = {
      userId: req.user.uid,
      questId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      completedAt: null,
      tokensEarned: 0,
    };

    const ref = await db.collection('participations').add(participation);
    return res.status(201).json({ id: ref.id, ...participation });
  } catch (err) {
    console.error('Join quest error:', err);
    return res.status(500).json({ error: 'Failed to join quest' });
  }
});

// ─── List rewards ─────────────────────────────────────────────────────────────
router.get('/rewards', async (req, res) => {
  try {
    const snap = await db.collection('rewards').where('available', '==', true).get();
    const rewards = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(rewards);
  } catch (err) {
    console.error('List rewards error:', err);
    return res.status(500).json({ error: 'Failed to list rewards' });
  }
});

// ─── Redeem a reward ─────────────────────────────────────────────────────────
router.post('/rewards/:id/redeem', async (req, res) => {
  const { id: rewardId } = req.params;

  try {
    const rewardDoc = await db.collection('rewards').doc(rewardId).get();
    if (!rewardDoc.exists) return res.status(404).json({ error: 'Reward not found' });

    const reward = rewardDoc.data();
    if (!reward.available) return res.status(400).json({ error: 'Reward not available' });

    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    const user = userDoc.data();

    if ((user.tokens || 0) < reward.cost) {
      return res.status(402).json({
        error: 'Insufficient tokens',
        required: reward.cost,
        current: user.tokens || 0,
      });
    }

    // Deduct tokens and record redemption atomically via batch
    const batch = db.batch();
    batch.update(userRef, { tokens: (user.tokens || 0) - reward.cost });

    const redemptionRef = db.collection('redemptions').doc();
    batch.set(redemptionRef, {
      userId: req.user.uid,
      rewardId,
      rewardName: reward.name,
      cost: reward.cost,
      redeemedAt: new Date().toISOString(),
    });

    await batch.commit();
    return res.json({ message: 'Reward redeemed successfully', redemptionId: redemptionRef.id });
  } catch (err) {
    console.error('Redeem reward error:', err);
    return res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// ─── List earned badges ───────────────────────────────────────────────────────
router.get('/badges', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });
    return res.json(doc.data().badges || []);
  } catch (err) {
    console.error('Badges error:', err);
    return res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// ─── Public leaderboard ───────────────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const snap = await db
      .collection('users')
      .orderBy('tokens', 'desc')
      .limit(50)
      .get();

    const leaderboard = snap.docs.map((d, i) => ({
      rank: i + 1,
      uid: d.id,
      displayName: d.data().displayName,
      tokens: d.data().tokens || 0,
      badges: (d.data().badges || []).length,
    }));

    return res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
