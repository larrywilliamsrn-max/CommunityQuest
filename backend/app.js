require("dotenv").config();
const express = require("express");
const cors    = require("cors");

// ── Services ───────────────────────────────────────────────────────────────────
const blockchainService = require("./services/blockchainService");

// ── Routes ─────────────────────────────────────────────────────────────────────
const blockchainRoutes  = require("./routes/blockchain");
const authRoutes        = require("./routes/auth");
const profileRoutes     = require("./routes/profile");
const questRoutes       = require("./routes/quests");
const scanRoutes        = require("./routes/scans");
const boothRoutes       = require("./routes/booths");
const rewardRoutes      = require("./routes/rewards");
const participantRoutes = require("./routes/participants");
const leaderboardRoutes = require("./routes/leaderboard");
const statsRoutes       = require("./routes/stats");

const app = express();
app.use(cors());
app.use(express.json());

// ── Blockchain ─────────────────────────────────────────────────────────────────
blockchainService.init();
app.use("/api/blockchain", blockchainRoutes);

// ── Auth ───────────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);

// ── Core APIs ──────────────────────────────────────────────────────────────────
app.use("/api/profile",      profileRoutes);
app.use("/api/quests",       questRoutes);
app.use("/api/scans",        scanRoutes);
app.use("/api/booths",       boothRoutes);
app.use("/api/rewards",      rewardRoutes);

// ── Organizer APIs ─────────────────────────────────────────────────────────────
app.use("/api/participants",  participantRoutes);
app.use("/api/leaderboard",  leaderboardRoutes);
app.use("/api/stats",        statsRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// ── 404 fallback ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅  QuestTime API running on http://localhost:${PORT}`);
  console.log("   Routes: auth | profile | quests | scans | booths | rewards | participants | leaderboard | stats | blockchain");
});

module.exports = app;