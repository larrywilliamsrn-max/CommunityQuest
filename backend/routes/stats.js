/**
 * routes/stats.js  (organizer only)
 *
 * GET /api/stats — live analytics for the admin dashboard
 * Returns: { participantsCount, activeBooths, activeQuests, avgXP,
 *            totalTokensAwarded, completedQuests, pendingParticipations }
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('organizer'));

router.get('/', async (req, res) => {
  try {
    const [usersSnap, boothsSnap, questsSnap, partsSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'participant').get(),
      db.collection('booths').get(),
      db.collection('quests').get(),
      db.collection('participations').get(),
    ]);

    const users  = usersSnap.docs.map(d => d.data());
    const parts  = partsSnap.docs.map(d => d.data());
    const quests = questsSnap.docs.map(d => d.data());

    const avgXP = users.length
      ? Math.round(users.reduce((s, u) => s + (u.xp || 0), 0) / users.length)
      : 0;

    const totalTokensAwarded = parts
      .filter(p => p.status === 'completed')
      .reduce((s, p) => s + (p.tokensEarned || 0), 0);

    return res.json({
      participantsCount:    users.length,
      activeBooths:         boothsSnap.size,
      activeQuests:         quests.filter(q => q.active).length,
      totalQuests:          quests.length,
      avgXP,
      totalTokensAwarded,
      completedQuests:      parts.filter(p => p.status === 'completed').length,
      pendingParticipations: parts.filter(p => p.status === 'in_progress').length,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
