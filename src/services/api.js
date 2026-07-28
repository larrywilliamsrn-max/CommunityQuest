/**
 * services/api.js
 *
 * Thin wrapper around fetch that:
 *  - Points at /api (proxied to http://localhost:4000 in dev via vite.config.js)
 *  - Attaches the JWT stored in localStorage as a Bearer token
 *  - Returns parsed JSON or throws an Error with the server message
 */

const BASE = '/api'

function getToken() {
  return localStorage.getItem('questchain-token') || null
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const body = await res.json()
      message = body.error || message
    } catch (_) { /* ignore parse errors */ }
    throw new Error(message)
  }

  return res.json()
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /api/auth/login  →  { token, role, user } */
export function loginWithWallet(wallet, role) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ wallet, role }),
  })
}

/** GET /api/auth/me  →  user object */
export function getMe() {
  return request('/auth/me')
}

// ─── Profile ──────────────────────────────────────────────────────────────────

/** GET /api/profile  →  { id, name, role, xp, tokens, level, badges, ... } */
export function getProfile() {
  return request('/profile')
}

/** GET /api/profile/badges  →  string[] */
export function getBadges() {
  return request('/profile/badges')
}

// ─── Quests ───────────────────────────────────────────────────────────────────

/** GET /api/quests?status=active|completed  →  Quest[] */
export function getQuests(status) {
  const qs = status ? `?status=${status}` : ''
  return request(`/quests${qs}`)
}

/** POST /api/quests  →  Quest (organizer only) */
export function createQuest(data) {
  return request('/quests', { method: 'POST', body: JSON.stringify(data) })
}

/** POST /api/quests/:questId/complete  →  { xp, tokens, badges, newTotal } */
export function completeQuest(questId, extra = {}) {
  return request(`/quests/${questId}/complete`, {
    method: 'POST',
    body: JSON.stringify(extra),
  })
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/** GET /api/leaderboard  →  { rank, uid, displayName, xp, tokens, level }[] */
export function getLeaderboard(limit = 10) {
  return request(`/leaderboard?limit=${limit}`)
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

/** GET /api/rewards  →  Reward[] */
export function getRewards() {
  return request('/rewards')
}

/** POST /api/rewards/:rewardId/redeem  →  { message, updatedWallet } */
export function redeemReward(rewardId) {
  return request(`/rewards/${rewardId}/redeem`, { method: 'POST' })
}

// ─── Organizer ────────────────────────────────────────────────────────────────

/** GET /api/stats  →  live event analytics */
export function getStats() {
  return request('/stats')
}

/** GET /api/participants  →  Participant[] */
export function getParticipants(status) {
  const qs = status ? `?status=${status}` : ''
  return request(`/participants${qs}`)
}

/** POST /api/participants/:id/approve */
export function approveParticipant(id, note = '') {
  return request(`/participants/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}
