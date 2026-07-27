/**
 * routes/scans.js
 *
 * POST /api/scans  — QR scan handler
 * Body: { qrPayload, userId? }
 * Returns: { questId, boothId, reward: { xp, tokens, badges }, status }
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', async (req, res) => {
  const { qrPayload } = req.body;
  if (!qrPayload) return res.status(400).json({ error: 'qrPayload is required' });

  const actingUid = req.user.uid;

  try {
    let questId = null;
    let boothId = null;

    // Parse prefixed payload or fall back to raw doc lookup
    if (qrPayload.startsWith('quest:')) {
      questId = qrPayload.slice(6).trim();
    } else if (qrPayload.startsWith('booth:')) {
      boothId = qrPayload.slice(6).trim();
      const qs = await db.collection('quests').where('boothId', '==', boothId).where('active', '==', true).limit(1).get();
      if (!qs.empty) questId = qs.docs[0].id;
    } else {
      const qDoc = await db.collection('quests').doc(qrPayload).get();
      if (qDoc.exists) {
        questId = qrPayload;
        boothId = qDoc.data().boothId || null;
      } else {
        const bDoc = await db.collection('booths').doc(qrPayload).get();
        if (bDoc.exists) boothId = qrPayload;
        else return res.status(404).json({ error: 'QR payload did not match any quest or booth' });
      }
    }

    if (!questId) {
      return res.json({ questId: null, boothId, reward: { xp: 0, tokens: 0, badges: [] }, status: 'booth_scanned_no_quest' });
    }

    const questDoc = await db.collection('quests').doc(questId).get();
    if (!questDoc.exists) return res.status(404).json({ error: 'Quest not found' });
    const quest = questDoc.data();

    if (!quest.active) return res.json({ questId, boothId, reward: { xp: 0, tokens: 0, badges: [] }, status: 'quest_inactive' });

    const already = await db.collection('participations')
      .where('userId', '==', actingUid).where('questId', '==', questId).where('status', '==', 'completed').limit(1).get();

    if (!already.empty) return res.json({ questId, boothId, reward: { xp: 0, tokens: 0, badges: [] }, status: 'already_completed' });

    const userRef = db.collection('users').doc(actingUid);
    const userDoc = await userRef.get();
    const user    = userDoc.data() || {};

    const xpEarned     = quest.xpReward   || 0;
    const tokensEarned = quest.tokenReward || 0;
    const newBadges    = [];
    const currentBadges = user.badges || [];
    if (quest.badgeOnComplete && !currentBadges.includes(quest.badgeOnComplete)) newBadges.push(quest.badgeOnComplete);

    const newXP   = (user.xp || 0) + xpEarned;
    const batch   = db.batch();
    batch.set(db.collection('participations').doc(), {
      userId: actingUid, questId, boothId: boothId || null, status: 'completed',
      xpEarned, tokensEarned, startedAt: new Date().toISOString(), completedAt: new Date().toISOString(),
    });
    batch.update(userRef, {
      xp: newXP, tokens: (user.tokens || 0) + tokensEarned,
      level: Math.floor(newXP / 500) + 1, badges: [...currentBadges, ...newBadges],
    });
    await batch.commit();

    return res.json({ questId, boothId, reward: { xp: xpEarned, tokens: tokensEarned, badges: newBadges }, status: 'completed' });
  } catch (err) {
    console.error('Scan error:', err);
    return res.status(500).json({ error: 'Scan processing failed' });
  }
});

module.exports = router;
