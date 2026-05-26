'use strict';

const { query } = require('../config/database');
const ws = require('../services/websocket');

// ─── GET /accidents ───────────────────────────────────────────────────────────
const getAllAccidents = async (req, res, next) => {
  try {
    const { severity, status, city, date_from, date_to, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (severity)  { conditions.push(`a.severity = $${idx++}`);             params.push(severity); }
    if (status)    { conditions.push(`a.status = $${idx++}`);               params.push(status); }
    if (city)      { conditions.push(`c.city ILIKE $${idx++}`);             params.push(`%${city}%`); }
    if (date_from) { conditions.push(`a.detected_at >= $${idx++}`);         params.push(date_from); }
    if (date_to)   { conditions.push(`a.detected_at <= $${idx++}`);         params.push(date_to); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const countRes = await query(
      `SELECT COUNT(*) FROM accidents a LEFT JOIN cameras c ON a.camera_id = c.id ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const { rows } = await query(
      `SELECT a.*, c.name AS camera_name, c.city, c.location AS camera_location
       FROM accidents a
       LEFT JOIN cameras c ON a.camera_id = c.id
       ${where}
       ORDER BY a.detected_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({
      success: true,
      data: {
        accidents: rows,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /accidents/live ──────────────────────────────────────────────────────
const getLiveAccidents = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, c.name AS camera_name, c.city, c.location AS camera_location
       FROM accidents a
       LEFT JOIN cameras c ON a.camera_id = c.id
       WHERE a.status IN ('detected', 'responding')
       ORDER BY
         CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         a.detected_at DESC`
    );
    res.json({ success: true, data: { accidents: rows, count: rows.length } });
  } catch (err) { next(err); }
};

// ─── GET /accidents/stats ─────────────────────────────────────────────────────
const getAccidentStats = async (req, res, next) => {
  try {
    const [totalRes, severityRes, statusRes, todayRes, resolvedRes] = await Promise.all([
      query('SELECT COUNT(*) FROM accidents'),
      query('SELECT severity, COUNT(*) AS count FROM accidents GROUP BY severity'),
      query('SELECT status, COUNT(*) AS count FROM accidents GROUP BY status'),
      query(`SELECT COUNT(*) FROM accidents WHERE detected_at >= CURRENT_DATE`),
      query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/60),2) AS avg_resolution_minutes
             FROM accidents WHERE resolved_at IS NOT NULL`),
    ]);

    res.json({
      success: true,
      data: {
        total:               parseInt(totalRes.rows[0].count),
        today:               parseInt(todayRes.rows[0].count),
        by_severity:         severityRes.rows.reduce((acc, r) => { acc[r.severity] = parseInt(r.count); return acc; }, {}),
        by_status:           statusRes.rows.reduce((acc, r) => { acc[r.status]   = parseInt(r.count); return acc; }, {}),
        avg_resolution_mins: resolvedRes.rows[0].avg_resolution_minutes,
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /accidents/:id ───────────────────────────────────────────────────────
const getAccidentById = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT a.*, c.name AS camera_name, c.city, c.location AS camera_location,
              c.stream_url, c.latitude AS camera_lat, c.longitude AS camera_lng
       FROM accidents a
       LEFT JOIN cameras c ON a.camera_id = c.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Accident not found.' });

    // Also fetch related alerts and incidents
    const [alertRes, incRes] = await Promise.all([
      query('SELECT * FROM alerts   WHERE accident_id = $1 ORDER BY created_at DESC', [req.params.id]),
      query('SELECT * FROM incidents WHERE accident_id = $1 ORDER BY created_at DESC', [req.params.id]),
    ]);

    res.json({
      success: true,
      data: { accident: rows[0], alerts: alertRes.rows, incidents: incRes.rows },
    });
  } catch (err) { next(err); }
};

// ─── POST /accidents ──────────────────────────────────────────────────────────
const createAccident = async (req, res, next) => {
  try {
    const { camera_id, severity, latitude, longitude, location_name, description, vehicle_count, image_url } = req.body;
    const { rows } = await query(
      `INSERT INTO accidents
         (camera_id, severity, status, latitude, longitude, location_name, description, vehicle_count, image_url)
       VALUES ($1,$2,'detected',$3,$4,$5,$6,$7,$8) RETURNING *`,
      [camera_id || null, severity, latitude || null, longitude || null, location_name || null, description || null, vehicle_count || 0, image_url || null]
    );

    // Fetch with camera info for WS broadcast
    const full = await query(
      `SELECT a.*, c.name AS camera_name, c.city FROM accidents a LEFT JOIN cameras c ON a.camera_id = c.id WHERE a.id = $1`,
      [rows[0].id]
    );
    ws.broadcast('accident:detected', { accident: full.rows[0] });

    res.status(201).json({ success: true, message: 'Accident recorded.', data: { accident: rows[0] } });
  } catch (err) { next(err); }
};

// ─── PUT /accidents/:id/status ────────────────────────────────────────────────
const updateAccidentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const resolvedAt = status === 'resolved' ? 'NOW()' : 'NULL';

    const { rows } = await query(
      `UPDATE accidents SET status = $1, resolved_at = ${resolvedAt} WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Accident not found.' });

    ws.broadcast('accident:updated', { accidentId: rows[0].id, status, updatedBy: req.user.id });
    res.json({ success: true, message: 'Status updated.', data: { accident: rows[0] } });
  } catch (err) { next(err); }
};

// ─── DELETE /accidents/:id ────────────────────────────────────────────────────
const deleteAccident = async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM accidents WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Accident not found.' });
    res.json({ success: true, message: 'Accident deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAllAccidents, getLiveAccidents, getAccidentStats, getAccidentById, createAccident, updateAccidentStatus, deleteAccident };
