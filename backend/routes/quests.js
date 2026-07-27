/**
 * routes/quests.js
 *
 * GET  /api/quests                       — list quests (?status=active|queued|completed&boothId=)
 * GET  /api/quests/:questId              — single quest detail
 * POST /api/quests                       — create quest (organizer only)
 * PUT  /api/quests/:questId              — update quest (organizer only)
 * POST /api/quests/:questId/complete     — participant completes quest → { xp, tokens, badges }
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// ─── List quests ──────────────────────────────────────────────────────────────
// Query params: ?status=active|queued|completed  &boothId=<id>
router.get('/', async (req, res) => {
  try {
    let query = db.collection('quests');

    if (req.query.status) {
      // Map frontend status labels to Firestore fields
      if (req.query.status === 'active') {
        query = query.where('active', '==', true);
      } else if (req.query.status === 'queued') {
        query = query.where('active', '==', false).where('queued', '==', true);
      }
      // 'completed' filtered client-side from participations
    }

    if (req.query.boothId) {
      query = query.where('boothId', '==', req.query.boothId);
    }

    const snap   = await query.orderBy('createdAt', 'desc').get();
    const quests = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // If status=completed, intersect with this user's completions
    if (req.query.status === 'completed') {
      const compSnap = await db
        .collection('participations')
        .where('userId', '==', req.user.uid)
        .where('status', '==', 'completed')
        .get();
      const completedIds = new Set(compSnap.docs.map(d => d.data().questId));
      return res.json(quests.filter(q => completedIds.has(q.id)));
    }

    return res.json(quests);
  } catch (err) {
    console.error('List quests error:', err);
    return res.status(500).json({ error: 'Failed to list quests' });
  }
});

// ─── Single quest ─────────────────────────────────────────────────────────────
router.get('/:questId', async (req, res) => {
  try {
    const doc = await db.collection('quests').doc(req.params.questId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Quest not found' });
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get quest error:', err);
    return res.status(500).json({ error: 'Failed to get quest' });
  }
});

// ─── Create quest (organizer only) ───────────────────────────────────────────
// Body: { title, description?, tokenReward, xpReward?, eventId?, boothId?, badgeOnComplete? }
router.post('/', requireRole('organizer'), async (req, res) => {
  const { title, description, tokenReward, xpReward, eventId, boothId, badgeOnComplete } = req.body;
  if (!title || tokenReward === undefined)
    return res.status(400).json({ error: 'title and tokenReward are required' });

  try {
    const quest = {
      organizerId:      req.user.uid,
      title,
      description:      description      || '',
      tokenReward:      Number(tokenReward),
      xpReward:         Number(xpReward) || 0,
      eventId:          eventId          || null,
      boothId:          boothId          || null,
      badgeOnComplete:  badgeOnComplete  || null,
      active:           true,
      queued:           false,
      createdAt:        new Date().toISOString(),
    };
    const ref = await db.collection('quests').add(quest);
    return res.status(201).json({ id: ref.id, ...quest });
  } catch (err) {
    console.error('Create quest error:', err);
    return res.status(500).json({ error: 'Failed to create quest' });
  }
});

// ─── Update quest (organizer only) ───────────────────────────────────────────
// Replaces fields — organizer must own the quest
router.put('/:questId', requireRole('organizer'), async (req, res) => {
  const allowed = ['title', 'description', 'tokenReward', 'xpReward', 'badgeOnComplete', 'active', 'queued', 'boothId', 'eventId'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (!Object.keys(updates).length)
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

// ─── Complete quest ───────────────────────────────────────────────────────────
// Called by participant (or scanner) after proving completion.
// Body: { scannerId?, proof? }
// Returns: { xp, tokens, badges }
router.post('/:questId/complete', async (req, res) => {
  const { questId } = req.params;

  try {
    const questDoc = await db.collection('quests').doc(questId).get();
    if (!questDoc.exists) return res.status(404).json({ error: 'Quest not found' });

    const quest = questDoc.data();
    if (!quest.active) return res.status(400).json({ error: 'Quest is not active' });

    // Idempotency check
    const existingSnap = await db
      .collection('participations')
      .where('userId', '==', req.user.uid)
      .where('questId', '==', questId)
      .where('status', '==', 'completed')
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return res.status(409).json({ error: 'Quest already completed' });
    }

    // Fetch user
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    const user    = userDoc.data() || {};

    const xpEarned     = quest.xpReward    || 0;
    const tokensEarned = quest.tokenReward  || 0;
    const newBadges    = [];

    const currentXP     = user.xp     || 0;
    const currentTokens = user.tokens  || 0;
    const currentBadges = user.badges  || [];
    const currentLevel  = user.level   || 1;

    if (quest.badgeOnComplete && !currentBadges.includes(quest.badgeOnComplete)) {
      newBadges.push(quest.badgeOnComplete);
    }

    // Simple levelling: level up every 500 XP
    const newXP    = currentXP + xpEarned;
    const newLevel = Math.floor(newXP / 500) + 1;

    const batch = db.batch();

    // Upsert participation record
    const partRef = db.collection('participations').doc();
    batch.set(partRef, {
      userId:         req.user.uid,
      questId,
      status:         'completed',
      scannerId:      req.body.scannerId || null,
      proof:          req.body.proof     || null,
      xpEarned,
      tokensEarned,
      startedAt:      new Date().toISOString(),
      completedAt:    new Date().toISOString(),
    });

    // Update user wallet
    batch.update(userRef, {
      xp:     newXP,
      tokens: currentTokens + tokensEarned,
      level:  newLevel,
      badges: [...currentBadges, ...newBadges],
    });

    await batch.commit();

    return res.json({
      xp:     xpEarned,
      tokens: tokensEarned,
      badges: newBadges,
      newTotal: { xp: newXP, tokens: currentTokens + tokensEarned, level: newLevel },
    });
  } catch (err) {
    console.error('Complete quest error:', err);
    return res.status(500).json({ error: 'Failed to complete quest' });
  }
});

module.exports = router;
