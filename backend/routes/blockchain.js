/**
 * routes/blockchain.js
 *
 * Mount in your existing Express app, e.g.:
 *   const blockchainRoutes = require("./routes/blockchain");
 *   app.use("/api/blockchain", blockchainRoutes);
 *
 * Reads (progress, leaderboard) are served from MySQL where possible (fast,
 * no RPC calls); writes go through blockchainService.js, which submits the
 * actual transaction. Swap in your own auth middleware where marked below —
 * these routes assume you already have `authenticateToken` / role checks
 * similar to your existing admin dashboard.
 */

const express = require("express");
const router = express.Router();
const blockchainService = require("../services/blockchainService");
const pool = require("../db/pool");

// TODO: replace with your real auth middleware (JWT + role check), matching
// the pattern used in your admin dashboard's ProtectedRoute / role system.
function requireAdmin(req, res, next) {
  next();
}
function requireAuth(req, res, next) {
  next();
}

// ---------------------------------------------------------------------
// POST /api/blockchain/register
// body: { walletAddress }
// ---------------------------------------------------------------------
router.post("/register", requireAuth, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

    const result = await blockchainService.registerParticipant(walletAddress);
    res.status(201).json({ message: "Participant registered", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// POST /api/blockchain/quests/:questId/complete
// body: { walletAddress, tokenReward }
// ---------------------------------------------------------------------
router.post("/quests/:questId/complete", requireAdmin, async (req, res) => {
  try {
    const { walletAddress, tokenReward } = req.body;
    const questId = Number(req.params.questId);
    if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

    const result = await blockchainService.completeQuest(walletAddress, questId, Number(tokenReward) || 0);
    res.json({ message: "Quest completed", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// POST /api/blockchain/tokens/award
// body: { walletAddress, amount, reason }
// ---------------------------------------------------------------------
router.post("/tokens/award", requireAdmin, async (req, res) => {
  try {
    const { walletAddress, amount, reason } = req.body;
    if (!walletAddress || !amount) {
      return res.status(400).json({ error: "walletAddress and amount are required" });
    }

    const result = await blockchainService.awardTokens(walletAddress, Number(amount), reason);
    res.json({ message: "Tokens awarded", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// POST /api/blockchain/badges/mint
// body: { walletAddress, badgeId }
// ---------------------------------------------------------------------
router.post("/badges/mint", requireAdmin, async (req, res) => {
  try {
    const { walletAddress, badgeId } = req.body;
    if (!walletAddress || badgeId === undefined) {
      return res.status(400).json({ error: "walletAddress and badgeId are required" });
    }

    const result = await blockchainService.mintBadge(walletAddress, Number(badgeId));
    res.json({ message: "Badge minted", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// POST /api/blockchain/rewards/:rewardId/redeem
// body: { walletAddress }
// ---------------------------------------------------------------------
router.post("/rewards/:rewardId/redeem", requireAuth, async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const rewardId = Number(req.params.rewardId);
    if (!walletAddress) return res.status(400).json({ error: "walletAddress is required" });

    const result = await blockchainService.redeemReward(walletAddress, rewardId);
    res.json({ message: "Reward redeemed", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// GET /api/blockchain/progress/:walletAddress
// ---------------------------------------------------------------------
router.get("/progress/:walletAddress", requireAuth, async (req, res) => {
  try {
    const progress = await blockchainService.viewProgress(req.params.walletAddress);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// GET /api/blockchain/leaderboard?offset=0&limit=20
//
// Served from the MySQL cache (fast, no RPC calls). Falls back to a direct
// chain read if the cache table is empty (e.g. indexer not running yet).
// ---------------------------------------------------------------------
router.get("/leaderboard", async (req, res) => {
  try {
    const offset = Number(req.query.offset) || 0;
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const [rows] = await pool.query(
      `SELECT wallet_address AS address, token_balance AS tokenBalance, quests_completed AS questsCompleted
       FROM leaderboard_cache
       ORDER BY token_balance DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    if (rows.length > 0) {
      return res.json(rows);
    }

    // Cache empty — fall back to a direct (unsorted) chain read.
    const onChain = await blockchainService.getLeaderboard(offset, limit);
    res.json(onChain.sort((a, b) => Number(b.tokenBalance) - Number(a.tokenBalance)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// POST /api/blockchain/tx
// body: { action, walletAddress, metadata? }
// Records a proof-of-action to Firestore and (if connected) submits a
// mock transaction via blockchainService for on-chain audit trail.
// ---------------------------------------------------------------------
const { db } = require('../config/firebase');

router.post('/tx', requireAuth, async (req, res) => {
  const { action, walletAddress, metadata } = req.body;
  if (!action || !walletAddress) {
    return res.status(400).json({ error: 'action and walletAddress are required' });
  }

  try {
    // Record to Firestore audit log
    const auditRef = db.collection('auditLog').doc();
    await auditRef.set({
      id:            auditRef.id,
      action,
      walletAddress,
      metadata:      metadata || {},
      recordedAt:    new Date().toISOString(),
    });

    // Attempt on-chain mock tx (non-fatal if blockchain is unavailable)
    let txHash = null;
    try {
      const result = await blockchainService.recordAction(walletAddress, action, metadata);
      txHash = result?.txHash || null;
    } catch (_) {
      // blockchain optional
    }

    return res.status(201).json({
      message:   'Transaction recorded',
      auditId:   auditRef.id,
      txHash,
    });
  } catch (err) {
    console.error('Blockchain tx error:', err);
    return res.status(500).json({ error: 'Failed to record transaction' });
  }
});

module.exports = router;
