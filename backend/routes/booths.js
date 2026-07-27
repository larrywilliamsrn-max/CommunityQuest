/**
 * routes/booths.js
 *
 * GET  /api/booths          — list all booths with status + coordinates
 * GET  /api/booths/:id      — single booth
 * POST /api/booths/:id/complete — mark booth visited/complete
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// List booths
router.get('/', async (req, res) => {
  try {
    const snap   = await db.collection('booths').get();
    const booths = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.json(booths);
  } catch (err) {
    console.error('List booths error:', err);
    return res.status(500).json({ error: 'Failed to list booths' });
  }
});

// Single booth
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('booths').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Booth not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get booth error:', err);
    return res.status(500).json({ error: 'Failed to get booth' });
  }
});

// Mark booth complete (records a visit; quest completion is handled by /api/scans or /api/quests/:id/complete)
router.post('/:id/complete', async (req, res) => {
  try {
    const boothId = req.params.id;
    const boothDoc = await db.collection('booths').doc(boothId).get();
    if (!boothDoc.exists) return res.status(404).json({ error: 'Booth not found' });

    // Check for existing visit
    const existingSnap = await db.collection('boothVisits')
      .where('userId', '==', req.user.uid).where('boothId', '==', boothId).limit(1).get();

    if (!existingSnap.empty) return res.status(409).json({ error: 'Booth already marked complete' });

    await db.collection('boothVisits').add({
      userId:    req.user.uid,
      boothId,
      visitedAt: new Date().toISOString(),
    });

    return res.json({ message: 'Booth marked as complete', boothId });
  } catch (err) {
    console.error('Booth complete error:', err);
    return res.status(500).json({ error: 'Failed to mark booth complete' });
  }
});

module.exports = router;
