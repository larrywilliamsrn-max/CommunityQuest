/**
 * middleware/auth.js
 *
 * Supports two token flavours:
 *  1. App-issued JWT  — created by POST /api/auth/login (wallet-based flow)
 *  2. Firebase ID token — created by the Firebase client SDK
 *
 * verifyToken tries JWT first (fast, no network), then falls back to Firebase.
 * Once decoded it attaches:
 *   req.user = { uid, wallet, email, role, displayName }
 */

const jwt  = require('jsonwebtoken');
const { auth, db } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'questtime-dev-secret-change-in-prod';

// ─── Token verification ───────────────────────────────────────────────────────
async function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header (Bearer token)' });
  }

  // ── 1. Try app JWT ────────────────────────────────────────────────────────
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { uid, wallet, email, role, displayName }
    return next();
  } catch (_) {
    // not an app JWT — fall through to Firebase check
  }

  // ── 2. Try Firebase ID token ──────────────────────────────────────────────
  try {
    const decoded  = await auth.verifyIdToken(token);
    const userDoc  = await db.collection('users').doc(decoded.uid).get();
    const data     = userDoc.exists ? userDoc.data() : {};

    req.user = {
      uid:         decoded.uid,
      wallet:      data.wallet      || null,
      email:       decoded.email    || data.email || null,
      role:        data.role        || 'participant',
      displayName: data.displayName || decoded.name || null,
    };
    return next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Role guard ───────────────────────────────────────────────────────────────
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required: ${roles.join(' | ')}`,
      });
    }
    next();
  };
}

// ─── JWT helpers (used by auth route) ────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { verifyToken, requireRole, signToken };
