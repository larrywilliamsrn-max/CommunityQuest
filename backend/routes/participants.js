/**
 * routes/participants.js  (organizer-only)
 *
 * GET  /api/participants          — list participants (filter: ?status=approved|pending)
 * GET  /api/participants/:id      — single participant detail
 * POST /api/participants/:id/approve — organizer approves participant
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('organizer'));

// List participants
router.get('/', async (req, res) => {
  try {
    let query = db.collection('users').where('role', '==', 'participant');
    if (req.query.status) query = query.where('status', '==', req.query.status);
    const snap = await query.orderBy('createdAt', 'desc').get();
    return res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error('List participants error:', err);
    return res.status(500).json({ error: 'Failed to list participants' });
  }
});

// Single participant
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    if (!doc.exists || doc.data().role !== 'participant')
      return res.status(404).json({ error: 'Participant not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get participant error:', err);
    return res.status(500).json({ error: 'Failed to get participant' });
  }
});

// Approve participant
// Body: { note? }
router.post('/:id/approve', async (req, res) => {
  try {
    const ref = db.collection('users').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'User not found' });

    await ref.update({
      status:     'approved',
      approvedBy: req.user.uid,
      approvedAt: new Date().toISOString(),
      approvalNote: req.body.note || '',
    });

    return res.json({ message: 'Participant approved' });
  } catch (err) {
    console.error('Approve participant error:', err);
    return res.status(500).json({ error: 'Failed to approve participant' });
  }
});

module.exports = router;
