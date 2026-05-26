'use strict';

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../config/database');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sanitiseUser = (u) => ({
  id:         u.id,
  name:       u.name,
  email:      u.email,
  role:       u.role,
  phone:      u.phone,
  created_at: u.created_at,
});

// ─── POST /auth/register ──────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'operator', phone } = req.body;

    const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, hash, role, phone || null]
    );

    const token = signToken(rows[0].id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { user: sanitiseUser(rows[0]), token },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: sanitiseUser(user), token },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /auth/profile ────────────────────────────────────────────────────────
const profile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: sanitiseUser(req.user) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /auth/profile ────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const { rows } = await query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone)
       WHERE id = $3 RETURNING *`,
      [name || null, phone || null, req.user.id]
    );
    res.json({
      success: true,
      message: 'Profile updated.',
      data: { user: sanitiseUser(rows[0]) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Stateless JWT — client simply discards the token.
const logout = (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully. Please discard your token.' });
};

module.exports = { register, login, profile, updateProfile, logout };
