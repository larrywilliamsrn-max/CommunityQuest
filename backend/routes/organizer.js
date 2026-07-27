/**
 * routes/organizer.js
 *
 * All routes that an ORGANIZER can call.
 *
 * ── Events ──────────────────────────────────────────────────────────────────
 * POST   /api/organizer/events                     — create an event
 * GET    /api/organizer/events                     — list my events
 * GET    /api/organizer/events/:eventId            — get single event
 * PATCH  /api/organizer/events/:eventId            — update event
 * DELETE /api/organizer/events/:eventId            — delete event
 *
 * ── Booths ──────────────────────────────────────────────────────────────────
 * POST   /api/organizer/events/:eventId/booths     — create a booth
 * GET    /api/organizer/events/:eventId/booths     — list booths for event
 * PATCH  /api/organizer/booths/:boothId            — update booth
 * DELETE /api/organizer/booths/:boothId            — delete booth
 *
 * ── Quests ──────────────────────────────────────────────────────────────────
 * POST   /api/organizer/quests                     — create a quest
 * GET    /api/organizer/quests                     — list quests (filter by event)
 * PATCH  /api/organizer/quests/:questId            — update quest
 * DELETE /api/organizer/quests/:questId            — delete quest
 *
 * ── Participation Approvals ──────────────────────────────────────────────────
 * GET    /api/organizer/participations             — list pending completions
 * POST   /api/organizer/participations/:id/approve — approve & award tokens
 * POST   /api/organizer/participations/:id/reject  — reject submission
 *
 * ── Bonus Tokens ────────────────────────────────────────────────────────────
 * POST   /api/organizer/users/:uid/bonus           — award bonus tokens
 *
 * ── Analytics ───────────────────────────────────────────────────────────────
 * GET    /api/organizer/analytics                  — live analytics summary
 * GET    /api/organizer/leaderboard                — full leaderboard
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

// All organizer routes require authentication + organizer role
router.use(verifyToken);
router.use(requireRole('organizer'));

// ════════════════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════════════════

// Create event
// Body: { name, description, startDate, endDate, location? }
router.post('/events', async (req, res) => {
  const { name, description, startDate, endDate, location } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ error: 'name, startDate, and endDate are required' });
  }

  try {
    const event = {
      organizerId: req.user.uid,
      name,
      description: description || '',
      startDate,
      endDate,
      location: location || '',
      active: true,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('events').add(event);
    return res.status(201).json({ id: ref.id, ...event });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

// List my events
router.get('/events', async (req, res) => {
  try {
    const snap = await db
      .collection('events')
      .where('organizerId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(events);
  } catch (err) {
    console.error('List events error:', err);
    return res.status(500).json({ error: 'Failed to list events' });
  }
});

// Get single event
router.get('/events/:eventId', async (req, res) => {
  try {
    const doc = await db.collection('events').doc(req.params.eventId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your event' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get event error:', err);
    return res.status(500).json({ error: 'Failed to get event' });
  }
});

// Update event
router.patch('/events/:eventId', async (req, res) => {
  const allowed = ['name', 'description', 'startDate', 'endDate', 'location', 'active'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No updatable fields provided' });

  try {
    const ref = db.collection('events').doc(req.params.eventId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your event' });

    await ref.update(updates);
    return res.json({ message: 'Event updated', updates });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const ref = db.collection('events').doc(req.params.eventId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Event not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your event' });

    await ref.delete();
    return res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// BOOTHS
// ════════════════════════════════════════════════════════════════════════════

// Create booth under event
// Body: { name, description?, location? }
router.post('/events/:eventId/booths', async (req, res) => {
  const { name, description, location } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    // Verify event ownership
    const eventDoc = await db.collection('events').doc(req.params.eventId).get();
    if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });
    if (eventDoc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your event' });

    const booth = {
      eventId: req.params.eventId,
      organizerId: req.user.uid,
      name,
      description: description || '',
      location: location || '',
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('booths').add(booth);
    return res.status(201).json({ id: ref.id, ...booth });
  } catch (err) {
    console.error('Create booth error:', err);
    return res.status(500).json({ error: 'Failed to create booth' });
  }
});

// List booths for an event
router.get('/events/:eventId/booths', async (req, res) => {
  try {
    const snap = await db
      .collection('booths')
      .where('eventId', '==', req.params.eventId)
      .get();
    const booths = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(booths);
  } catch (err) {
    console.error('List booths error:', err);
    return res.status(500).json({ error: 'Failed to list booths' });
  }
});

// Update booth
router.patch('/booths/:boothId', async (req, res) => {
  const allowed = ['name', 'description', 'location'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No updatable fields provided' });

  try {
    const ref = db.collection('booths').doc(req.params.boothId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Booth not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your booth' });

    await ref.update(updates);
    return res.json({ message: 'Booth updated', updates });
  } catch (err) {
    console.error('Update booth error:', err);
    return res.status(500).json({ error: 'Failed to update booth' });
  }
});

// Delete booth
router.delete('/booths/:boothId', async (req, res) => {
  try {
    const ref = db.collection('booths').doc(req.params.boothId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Booth not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your booth' });

    await ref.delete();
    return res.json({ message: 'Booth deleted' });
  } catch (err) {
    console.error('Delete booth error:', err);
    return res.status(500).json({ error: 'Failed to delete booth' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// QUESTS
// ════════════════════════════════════════════════════════════════════════════

// Create quest
// Body: { title, description, tokenReward, eventId?, boothId?, badgeOnComplete? }
router.post('/quests', async (req, res) => {
  const { title, description, tokenReward, eventId, boothId, badgeOnComplete } = req.body;
  if (!title || tokenReward === undefined) {
    return res.status(400).json({ error: 'title and tokenReward are required' });
  }

  try {
    const quest = {
      organizerId: req.user.uid,
      title,
      description: description || '',
      tokenReward: Number(tokenReward),
      eventId: eventId || null,
      boothId: boothId || null,
      badgeOnComplete: badgeOnComplete || null,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection('quests').add(quest);
    return res.status(201).json({ id: ref.id, ...quest });
  } catch (err) {
    console.error('Create quest error:', err);
    return res.status(500).json({ error: 'Failed to create quest' });
  }
});

// List quests (optionally filter by ?eventId=)
router.get('/quests', async (req, res) => {
  try {
    let query = db.collection('quests').where('organizerId', '==', req.user.uid);
    if (req.query.eventId) {
      query = query.where('eventId', '==', req.query.eventId);
    }
    const snap = await query.orderBy('createdAt', 'desc').get();
    const quests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.json(quests);
  } catch (err) {
    console.error('List quests error:', err);
    return res.status(500).json({ error: 'Failed to list quests' });
  }
});

// Update quest
router.patch('/quests/:questId', async (req, res) => {
  const allowed = ['title', 'description', 'tokenReward', 'badgeOnComplete', 'active'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (Object.keys(updates).length === 0)
    return res.status(400).json({ error: 'No updatable fields provided' });

  try {
    const ref = db.collection('quests').doc(req.params.questId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Quest not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your quest' });

    await ref.update(updates);
    return res.json({ message: 'Quest updated', updates });
  } catch (err) {
    console.error('Update quest error:', err);
    return res.status(500).json({ error: 'Failed to update quest' });
  }
});

// Delete quest
router.delete('/quests/:questId', async (req, res) => {
  try {
    const ref = db.collection('quests').doc(req.params.questId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Quest not found' });
    if (doc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your quest' });

    await ref.delete();
    return res.json({ message: 'Quest deleted' });
  } catch (err) {
    console.error('Delete quest error:', err);
    return res.status(500).json({ error: 'Failed to delete quest' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// PARTICIPATION APPROVALS
// ════════════════════════════════════════════════════════════════════════════

// List pending participations for organizer's quests
router.get('/participations', async (req, res) => {
  try {
    // Get all quest IDs owned by this organizer
    const questsSnap = await db
      .collection('quests')
      .where('organizerId', '==', req.user.uid)
      .get();
    const questIds = questsSnap.docs.map((d) => d.id);

    if (questIds.length === 0) return res.json([]);

    // Firestore 'in' supports up to 30 values; chunk if needed
    const chunkSize = 30;
    const chunks = [];
    for (let i = 0; i < questIds.length; i += chunkSize) {
      chunks.push(questIds.slice(i, i + chunkSize));
    }

    const results = [];
    for (const chunk of chunks) {
      const snap = await db
        .collection('participations')
        .where('questId', 'in', chunk)
        .where('status', '==', 'in_progress')
        .get();
      snap.docs.forEach((d) => results.push({ id: d.id, ...d.data() }));
    }

    return res.json(results);
  } catch (err) {
    console.error('List participations error:', err);
    return res.status(500).json({ error: 'Failed to list participations' });
  }
});

// Approve a participation — marks complete, awards tokens + optional badge
router.post('/participations/:id/approve', async (req, res) => {
  const { id } = req.params;

  try {
    const partRef = db.collection('participations').doc(id);
    const partDoc = await partRef.get();
    if (!partDoc.exists) return res.status(404).json({ error: 'Participation not found' });

    const part = partDoc.data();
    if (part.status === 'completed')
      return res.status(400).json({ error: 'Already approved' });

    // Verify organizer owns the quest
    const questDoc = await db.collection('quests').doc(part.questId).get();
    if (!questDoc.exists) return res.status(404).json({ error: 'Quest not found' });
    if (questDoc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your quest' });

    const quest = questDoc.data();
    const tokensEarned = quest.tokenReward || 0;

    const userRef = db.collection('users').doc(part.userId);
    const userDoc = await userRef.get();
    const currentTokens = userDoc.exists ? (userDoc.data().tokens || 0) : 0;
    const currentBadges = userDoc.exists ? (userDoc.data().badges || []) : [];

    const batch = db.batch();

    // Update participation
    batch.update(partRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      tokensEarned,
      approvedBy: req.user.uid,
    });

    // Award tokens and badge
    const userUpdates = { tokens: currentTokens + tokensEarned };
    if (quest.badgeOnComplete && !currentBadges.includes(quest.badgeOnComplete)) {
      userUpdates.badges = [...currentBadges, quest.badgeOnComplete];
    }
    batch.update(userRef, userUpdates);

    await batch.commit();
    return res.json({ message: 'Participation approved', tokensAwarded: tokensEarned });
  } catch (err) {
    console.error('Approve participation error:', err);
    return res.status(500).json({ error: 'Failed to approve participation' });
  }
});

// Reject a participation
// Body: { reason? }
router.post('/participations/:id/reject', async (req, res) => {
  const { id } = req.params;

  try {
    const partRef = db.collection('participations').doc(id);
    const partDoc = await partRef.get();
    if (!partDoc.exists) return res.status(404).json({ error: 'Participation not found' });
    if (partDoc.data().status === 'rejected')
      return res.status(400).json({ error: 'Already rejected' });

    // Verify organizer owns the quest
    const questDoc = await db.collection('quests').doc(partDoc.data().questId).get();
    if (!questDoc.exists) return res.status(404).json({ error: 'Quest not found' });
    if (questDoc.data().organizerId !== req.user.uid)
      return res.status(403).json({ error: 'Not your quest' });

    await partRef.update({
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: req.body.reason || '',
      rejectedBy: req.user.uid,
    });

    return res.json({ message: 'Participation rejected' });
  } catch (err) {
    console.error('Reject participation error:', err);
    return res.status(500).json({ error: 'Failed to reject participation' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// BONUS TOKENS
// ════════════════════════════════════════════════════════════════════════════

// Award bonus tokens to any user
// Body: { amount, reason? }
router.post('/users/:uid/bonus', async (req, res) => {
  const { uid } = req.params;
  const { amount, reason } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const currentTokens = userDoc.data().tokens || 0;
    const bonusAmount = Number(amount);

    const batch = db.batch();
    batch.update(userRef, { tokens: currentTokens + bonusAmount });

    // Log bonus
    const bonusRef = db.collection('bonuses').doc();
    batch.set(bonusRef, {
      userId: uid,
      amount: bonusAmount,
      reason: reason || 'Organizer bonus',
      awardedBy: req.user.uid,
      awardedAt: new Date().toISOString(),
    });

    await batch.commit();
    return res.json({
      message: 'Bonus tokens awarded',
      newBalance: currentTokens + bonusAmount,
    });
  } catch (err) {
    console.error('Award bonus error:', err);
    return res.status(500).json({ error: 'Failed to award bonus tokens' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════════════════════════

// Live analytics summary for organizer's events
router.get('/analytics', async (req, res) => {
  try {
    const [eventsSnap, questsSnap, participationsSnap, usersSnap] = await Promise.all([
      db.collection('events').where('organizerId', '==', req.user.uid).get(),
      db.collection('quests').where('organizerId', '==', req.user.uid).get(),
      db.collection('participations').get(),
      db.collection('users').get(),
    ]);

    const myQuestIds = new Set(questsSnap.docs.map((d) => d.id));

    const allParticipations = participationsSnap.docs.map((d) => d.data());
    const myParticipations = allParticipations.filter((p) => myQuestIds.has(p.questId));

    const totalTokensAwarded = myParticipations
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.tokensEarned || 0), 0);

    return res.json({
      totalEvents: eventsSnap.size,
      totalQuests: questsSnap.size,
      totalParticipants: usersSnap.size,
      totalParticipations: myParticipations.length,
      completedParticipations: myParticipations.filter((p) => p.status === 'completed').length,
      pendingParticipations: myParticipations.filter((p) => p.status === 'in_progress').length,
      totalTokensAwarded,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Full leaderboard (organizer view — no trimming)
router.get('/leaderboard', async (req, res) => {
  try {
    const snap = await db.collection('users').orderBy('tokens', 'desc').get();
    const leaderboard = snap.docs.map((d, i) => ({
      rank: i + 1,
      uid: d.id,
      displayName: d.data().displayName,
      email: d.data().email,
      tokens: d.data().tokens || 0,
      badges: d.data().badges || [],
    }));
    return res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
