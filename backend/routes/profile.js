/**
 * routes/profile.js
 *
 * GET   /api/profile           — full profile { id, name, role, xp, tokens, level, badges }
 * PATCH /api/profile           — update displayName / metadata
 * GET   /api/profile/badges    — earned badges list
 * GET   /api/profile/history   — activity ledger (quests, redemptions, bonuses)
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ─── GET /api/profile ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'Profile not found' });
    const d = doc.data();
    return res.json({
      id:          d.uid,
      name:        d.displayName,
      role:        d.role,
      xp:          d.xp          || 0,
      tokens:      d.tokens      || 0,
      level:       d.level       || 1,
      badges:      d.badges      || [],
      wallet:      d.wallet      || null,
      avatarUrl:   d.avatarUrl   || null,
      createdAt:   d.createdAt,
    });
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── PATCH /api/profile ───────────────────────────────────────────────────────
// Body: { displayName?, avatarUrl?, metadata? }
router.patch('/', async (req, res) => {
  const allowed = ['displayName', 'avatarUrl', 'metadata'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (!Object.keys(updates).length)
    return res.status(400).json({ error: 'No updatable fields provided' });

  try {
    await db.collection('users').doc(req.user.uid).update(updates);
    return res.json({ message: 'Profile updated', updates });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── GET /api/profile/badges ──────────────────────────────────────────────────
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

// ─── GET /api/profile/history ─────────────────────────────────────────────────
// Returns merged, time-sorted activity ledger
router.get('/history', async (req, res) => {
  try {
    const uid = req.user.uid;

    const [partSnap, redeemSnap, bonusSnap] = await Promise.all([
      db.collection('participations').where('userId', '==', uid).orderBy('startedAt', 'desc').limit(50).get(),
      db.collection('redemptions').where('userId', '==', uid).orderBy('redeemedAt', 'desc').limit(30).get(),
      db.collection('bonuses').where('userId', '==', uid).orderBy('awardedAt', 'desc').limit(20).get(),
    ]);

    const events = [
      ...partSnap.docs.map(d => ({ type: 'quest', ...d.data(), timestamp: d.data().completedAt || d.data().startedAt })),
      ...redeemSnap.docs.map(d => ({ type: 'redemption', ...d.data(), timestamp: d.data().redeemedAt })),
      ...bonusSnap.docs.map(d => ({ type: 'bonus', ...d.data(), timestamp: d.data().awardedAt })),
    ];

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.json(events.slice(0, 80));
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ error: 'Failed to fetch activity history' });
  }
});

module.exports = router;
