/**
 * mockChain.js
 *
 * In-memory stand-in for the real QuestRegistry contract, used when
 * BLOCKCHAIN_MOCK=true. Mirrors the exact return shapes of blockchainService.js
 * so routes/blockchain.js works identically either way — useful for demos,
 * local dev without a funded testnet wallet, or automated tests.
 *
 * State resets whenever the process restarts. Not a substitute for the real
 * chain — just enough to demo the full flow end to end.
 */

let nextPassId = 1;
let nextTxSeq = 1;

const participants = new Map(); // address -> { registered, passTokenId, questsCompleted, tokensEarned, tokenBalance, badges: Set, completedQuests: Set }
const quests = new Map(); // questId -> true
const rewards = new Map(); // rewardId -> { name, cost, active }
const redemptions = []; // { participant, rewardId, timestamp }

function fakeTx() {
  const seq = nextTxSeq++;
  return { txHash: `0xmock${seq.toString().padStart(8, "0")}`, blockNumber: seq };
}

function getOrThrow(address) {
  const p = participants.get(address);
  if (!p) throw new Error("QuestRegistry: not registered");
  return p;
}

function registerParticipant(address) {
  if (participants.has(address)) throw new Error("QuestRegistry: already registered");
  const passTokenId = nextPassId++;
  participants.set(address, {
    registered: true,
    passTokenId,
    questsCompleted: 0,
    tokensEarned: 0,
    tokenBalance: 0,
    badges: new Set(),
    completedQuests: new Set(),
  });
  return { ...fakeTx(), passTokenId: String(passTokenId) };
}

function defineQuest(questId) {
  quests.set(questId, true);
  return fakeTx();
}

function completeQuest(address, questId, tokenReward) {
  const p = getOrThrow(address);
  if (!quests.has(questId)) throw new Error("QuestRegistry: unknown quest");
  if (p.completedQuests.has(questId)) throw new Error("QuestRegistry: quest already completed");

  p.completedQuests.add(questId);
  p.questsCompleted += 1;
  if (tokenReward > 0) {
    p.tokensEarned += tokenReward;
    p.tokenBalance += tokenReward;
  }
  return fakeTx();
}

function awardTokens(address, amount) {
  const p = getOrThrow(address);
  p.tokensEarned += amount;
  p.tokenBalance += amount;
  return fakeTx();
}

function mintBadge(address, badgeId) {
  const p = getOrThrow(address);
  p.badges.add(badgeId);
  return fakeTx();
}

function defineReward(rewardId, name, cost) {
  rewards.set(rewardId, { name, cost, active: true });
  return fakeTx();
}

function redeemReward(address, rewardId) {
  const p = getOrThrow(address);
  const reward = rewards.get(rewardId);
  if (!reward || !reward.active) throw new Error("QuestRegistry: reward inactive or unknown");
  if (p.tokenBalance < reward.cost) throw new Error("QuestRegistry: insufficient tokens");

  p.tokenBalance -= reward.cost;
  redemptions.push({ participant: address, rewardId, timestamp: Date.now() });
  return fakeTx();
}

function viewProgress(address) {
  const p = participants.get(address);
  if (!p) {
    return {
      registered: false,
      questsCompleted: 0,
      currentTokenBalance: "0",
      lifetimeTokensEarned: "0",
      rewardsRedeemedCount: 0,
    };
  }
  return {
    registered: p.registered,
    questsCompleted: p.questsCompleted,
    currentTokenBalance: String(p.tokenBalance),
    lifetimeTokensEarned: String(p.tokensEarned),
    rewardsRedeemedCount: redemptions.filter((r) => r.participant === address).length,
  };
}

function getLeaderboard(offset = 0, limit = 20) {
  const all = Array.from(participants.entries()).map(([address, p]) => ({
    address,
    tokenBalance: String(p.tokenBalance),
    questsCompleted: p.questsCompleted,
  }));
  return all.slice(offset, offset + limit);
}

module.exports = {
  registerParticipant,
  defineQuest,
  completeQuest,
  awardTokens,
  mintBadge,
  defineReward,
  redeemReward,
  viewProgress,
  getLeaderboard,
};
