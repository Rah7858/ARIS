'use strict';

const { query } = require('../config/database');
const ws = require('../services/websocket');

// ─── GET /cameras ─────────────────────────────────────────────────────────────
const getAllCameras = async (req, res, next) => {
  try {
    const { city, status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (city)   { conditions.push(`city ILIKE $${idx++}`);   params.push(`%${city}%`); }
    if (status) { conditions.push(`status = $${idx++}`);     params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const countRes = await query(`SELECT COUNT(*) FROM cameras ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const { rows } = await query(
      `SELECT * FROM cameras ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({
      success: true,
      data: { cameras: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) { next(err); }
};

// ─── GET /cameras/:id ─────────────────────────────────────────────────────────
const getCameraById = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM cameras WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Camera not found.' });
    res.json({ success: true, data: { camera: rows[0] } });
  } catch (err) { next(err); }
};

// ─── POST /cameras ────────────────────────────────────────────────────────────
const createCamera = async (req, res, next) => {
  try {
    const { name, location, city, latitude, longitude, status = 'active', stream_url } = req.body;
    const { rows } = await query(
      `INSERT INTO cameras (name, location, city, latitude, longitude, status, stream_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, location, city, latitude, longitude, status, stream_url || null]
    );
    ws.broadcast('camera:status', { camera: rows[0], action: 'created' });
    res.status(201).json({ success: true, message: 'Camera created.', data: { camera: rows[0] } });
  } catch (err) { next(err); }
};

// ─── PUT /cameras/:id ─────────────────────────────────────────────────────────
const updateCamera = async (req, res, next) => {
  try {
    const { name, location, city, latitude, longitude, status, stream_url } = req.body;
    const { rows } = await query(
      `UPDATE cameras SET
         name       = COALESCE($1, name),
         location   = COALESCE($2, location),
         city       = COALESCE($3, city),
         latitude   = COALESCE($4, latitude),
         longitude  = COALESCE($5, longitude),
         status     = COALESCE($6, status),
         stream_url = COALESCE($7, stream_url)
       WHERE id = $8 RETURNING *`,
      [name, location, city, latitude, longitude, status, stream_url, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Camera not found.' });
    ws.broadcast('camera:status', { camera: rows[0], action: 'updated' });
    res.json({ success: true, message: 'Camera updated.', data: { camera: rows[0] } });
  } catch (err) { next(err); }
};

// ─── DELETE /cameras/:id ──────────────────────────────────────────────────────
const deleteCamera = async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM cameras WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Camera not found.' });
    ws.broadcast('camera:status', { cameraId: rows[0].id, action: 'deleted' });
    res.json({ success: true, message: 'Camera deleted.' });
  } catch (err) { next(err); }
};

// ─── PATCH /cameras/:id/status ────────────────────────────────────────────────
const toggleCameraStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'maintenance'].includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status. Use: active, inactive, maintenance.' });
    }
    const { rows } = await query(
      'UPDATE cameras SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Camera not found.' });
    ws.broadcast('camera:status', { camera: rows[0], action: 'status_changed' });
    res.json({ success: true, message: `Camera status updated to '${status}'.`, data: { camera: rows[0] } });
  } catch (err) { next(err); }
};

module.exports = { getAllCameras, getCameraById, createCamera, updateCamera, deleteCamera, toggleCameraStatus };
