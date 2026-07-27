/**
 * routes/leaderboard.js
 *
 * GET /api/leaderboard — top users ranked by tokens
 *   Query: ?limit=50
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  try {
    const snap = await db.collection('users').orderBy('tokens', 'desc').limit(limit).get();
    const board = snap.docs.map((d, i) => ({
      rank:        i + 1,
      uid:         d.id,
      displayName: d.data().displayName,
      xp:          d.data().xp     || 0,
      tokens:      d.data().tokens || 0,
      level:       d.data().level  || 1,
      badges:      (d.data().badges || []).length,
    }));
    return res.json(board);
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
