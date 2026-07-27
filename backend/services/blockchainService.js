/**
 * blockchainService.js
 *
 * Thin wrapper around the QuestRegistry contract (and its EventPassNFT /
 * ParticipationToken / AchievementBadge sub-contracts). All admin-only calls
 * are signed by this backend's ADMIN_PRIVATE_KEY wallet, which is the owner
 * of QuestRegistry on-chain — participants themselves never need gas or a
 * wallet signature for these actions.
 *
 * Every state-changing function here mirrors one of the requested contract
 * functions 1:1: registerParticipant, completeQuest, awardTokens, mintBadge,
 * redeemReward, viewProgress, getLeaderboard.
 */

const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const MOCK_MODE = process.env.BLOCKCHAIN_MOCK === "true";

let provider, adminWallet, questRegistry, participationToken, eventPass, achievementBadge;

function loadContractsConfig() {
  const configPath = path.join(__dirname, "..", "config", "contracts.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      "backend/config/contracts.json not found. Run `npm run deploy:testnet` in the " +
        "hardhat project first (or set BLOCKCHAIN_MOCK=true to develop without a chain)."
    );
  }
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function init() {
  if (MOCK_MODE) return; // mockChain.js handles everything in mock mode

  const config = loadContractsConfig();

  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

  questRegistry = new ethers.Contract(
    config.contracts.QuestRegistry.address,
    config.contracts.QuestRegistry.abi,
    adminWallet
  );
  participationToken = new ethers.Contract(
    config.contracts.ParticipationToken.address,
    config.contracts.ParticipationToken.abi,
    provider
  );
  eventPass = new ethers.Contract(
    config.contracts.EventPassNFT.address,
    config.contracts.EventPassNFT.abi,
    provider
  );
  achievementBadge = new ethers.Contract(
    config.contracts.AchievementBadge.address,
    config.contracts.AchievementBadge.abi,
    provider
  );
}

/** Waits for a tx and returns { txHash, blockNumber } for logging/storage. */
async function confirm(txPromise) {
  const tx = await txPromise;
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// ---------------------------------------------------------------------
// registerParticipant
// ---------------------------------------------------------------------
async function registerParticipant(walletAddress) {
  if (MOCK_MODE) return require("./mockChain").registerParticipant(walletAddress);

  const receipt = await confirm(questRegistry.registerParticipant(walletAddress));
  const passTokenId = (await eventPass.passOf(walletAddress)).toString();
  return { ...receipt, passTokenId };
}

// ---------------------------------------------------------------------
// completeQuest
// ---------------------------------------------------------------------
async function completeQuest(walletAddress, questId, tokenReward) {
  if (MOCK_MODE) return require("./mockChain").completeQuest(walletAddress, questId, tokenReward);

  return confirm(questRegistry.completeQuest(walletAddress, questId, tokenReward));
}

// ---------------------------------------------------------------------
// awardTokens
// ---------------------------------------------------------------------
async function awardTokens(walletAddress, amount, reason = "manual award") {
  if (MOCK_MODE) return require("./mockChain").awardTokens(walletAddress, amount, reason);

  return confirm(questRegistry.awardTokens(walletAddress, amount, reason));
}

// ---------------------------------------------------------------------
// mintBadge
// ---------------------------------------------------------------------
async function mintBadge(walletAddress, badgeId) {
  if (MOCK_MODE) return require("./mockChain").mintBadge(walletAddress, badgeId);

  return confirm(questRegistry.mintBadge(walletAddress, badgeId));
}

// ---------------------------------------------------------------------
// redeemReward
// ---------------------------------------------------------------------
async function redeemReward(walletAddress, rewardId) {
  if (MOCK_MODE) return require("./mockChain").redeemReward(walletAddress, rewardId);

  return confirm(questRegistry.redeemReward(walletAddress, rewardId));
}

// ---------------------------------------------------------------------
// viewProgress
// ---------------------------------------------------------------------
async function viewProgress(walletAddress) {
  if (MOCK_MODE) return require("./mockChain").viewProgress(walletAddress);

  const [registered, questsCompleted, currentTokenBalance, lifetimeTokensEarned, rewardsRedeemedCount] =
    await questRegistry.viewProgress(walletAddress);

  return {
    registered,
    questsCompleted: Number(questsCompleted),
    currentTokenBalance: currentTokenBalance.toString(),
    lifetimeTokensEarned: lifetimeTokensEarned.toString(),
    rewardsRedeemedCount: Number(rewardsRedeemedCount),
  };
}

// ---------------------------------------------------------------------
// getLeaderboard
// ---------------------------------------------------------------------
// NOTE: For a live app, prefer reading from the `leaderboard_cache` MySQL
// table (kept current by db/indexer.js) instead of calling this directly —
// it's indexed, sortable, and paginated without hitting the RPC provider on
// every page load. This function is here for on-demand chain verification.
async function getLeaderboard(offset = 0, limit = 20) {
  if (MOCK_MODE) return require("./mockChain").getLeaderboard(offset, limit);

  const [addrs, tokenBalances, questCounts] = await questRegistry.getLeaderboard(offset, limit);

  return addrs.map((address, i) => ({
    address,
    tokenBalance: tokenBalances[i].toString(),
    questsCompleted: Number(questCounts[i]),
  }));
}

// ---------------------------------------------------------------------
// Admin setup helpers (define quests / rewards / badge names once)
// ---------------------------------------------------------------------
async function defineQuest(questId) {
  if (MOCK_MODE) return require("./mockChain").defineQuest(questId);
  return confirm(questRegistry.defineQuest(questId));
}

async function defineReward(rewardId, name, cost) {
  if (MOCK_MODE) return require("./mockChain").defineReward(rewardId, name, cost);
  return confirm(questRegistry.defineReward(rewardId, name, cost));
}

module.exports = {
  init,
  registerParticipant,
  completeQuest,
  awardTokens,
  mintBadge,
  redeemReward,
  viewProgress,
  getLeaderboard,
  defineQuest,
  defineReward,
};
