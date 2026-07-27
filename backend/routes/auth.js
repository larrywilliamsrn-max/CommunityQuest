/**
 * routes/auth.js
 *
 * POST /api/auth/login   — wallet + role → { token, role, user }
 * GET  /api/auth/me      — current user (requires Bearer token)
 * POST /api/auth/logout  — invalidate (client-side; server-side blocklist optional)
 * POST /api/auth/register — seed Firestore profile after Firebase signUp
 */
const express = require('express');
const router  = express.Router();
const { db }  = require('../config/firebase');
const { verifyToken, signToken } = require('../middleware/auth');

// ─── Login (wallet-based) ─────────────────────────────────────────────────────
// Body: { wallet: "0x...", role: "participant"|"organizer" }
// In a real deployment you would verify a signed message here (ethers.verifyMessage).
// For now: upsert the user doc and return a signed JWT.
router.post('/login', async (req, res) => {
  const { wallet, role } = req.body;
  if (!wallet) return res.status(400).json({ error: 'wallet is required' });

  const safeRole = role === 'organizer' ? 'organizer' : 'participant';

  try {
    const uid     = wallet.toLowerCase(); // use wallet as UID for wallet-login users
    const userRef = db.collection('users').doc(uid);
    const snap    = await userRef.get();

    let userData;
    if (snap.exists) {
      userData = snap.data();
    } else {
      userData = {
        uid,
        wallet,
        displayName: `${safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}_${uid.slice(2, 8)}`,
        role: safeRole,
        xp: 0,
        tokens: 0,
        level: 1,
        badges: [],
        createdAt: new Date().toISOString(),
      };
      await userRef.set(userData);
    }

    const payload = {
      uid:         userData.uid,
      wallet:      userData.wallet,
      email:       userData.email || null,
      role:        userData.role,
      displayName: userData.displayName,
    };

    const token = signToken(payload);
    return res.json({ token, role: userData.role, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ error: 'Profile not found' });
    return res.json(doc.data());
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── Logout ───────────────────────────────────────────────────────────────────
// JWTs are stateless; the client drops the token.
// If you need server-side invalidation, push the jti to a Firestore blocklist here.
router.post('/logout', verifyToken, (req, res) => {
  return res.json({ message: 'Logged out. Please discard your token on the client.' });
});

// ─── Register (Firebase Auth flow) ───────────────────────────────────────────
// Called after Firebase signUp to seed the Firestore user doc.
// Body: { uid, email, displayName? }
router.post('/register', async (req, res) => {
  const { uid, email, displayName } = req.body;
  if (!uid || !email) return res.status(400).json({ error: 'uid and email are required' });

  try {
    const userRef  = db.collection('users').doc(uid);
    const existing = await userRef.get();
    if (existing.exists) return res.status(409).json({ error: 'User already registered' });

    const profile = {
      uid,
      email,
      wallet: null,
      displayName: displayName || email.split('@')[0],
      role: 'participant',
      xp: 0,
      tokens: 0,
      level: 1,
      badges: [],
      createdAt: new Date().toISOString(),
    };

    await userRef.set(profile);
    return res.status(201).json({ message: 'User registered', user: profile });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
