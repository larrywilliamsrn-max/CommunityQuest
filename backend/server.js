/**
 * server.js — example entry point.
 *
 * If you're dropping this into an EXISTING Express app instead of running
 * this standalone, just copy these two lines into your app's setup:
 *
 *   const blockchainRoutes = require("./routes/blockchain");
 *   app.use("/api/blockchain", blockchainRoutes);
 *
 * ...and call blockchainService.init() once at startup, and (optionally)
 * startIndexer() in a separate process (`npm run indexer`) so a crash in
 * the indexer doesn't take down your main API.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const blockchainService = require("./services/blockchainService");
const blockchainRoutes = require("./routes/blockchain");

const app = express();
app.use(cors());
app.use(express.json());

blockchainService.init();
app.use("/api/blockchain", blockchainRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Blockchain API listening on port ${PORT}`));
