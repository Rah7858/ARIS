'use strict';

const { query } = require('../config/database');
const ws = require('../services/websocket');
const { sendAlertEmail, buildAccidentAlertHtml } = require('../services/mailer');

// ─── GET /alerts ──────────────────────────────────────────────────────────────
const getAllAlerts = async (req, res, next) => {
  try {
    const { type, status, accident_id, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (type)        { conditions.push(`al.type = $${idx++}`);             params.push(type); }
    if (status)      { conditions.push(`al.status = $${idx++}`);           params.push(status); }
    if (accident_id) { conditions.push(`al.accident_id = $${idx++}`);      params.push(accident_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const countRes = await query(`SELECT COUNT(*) FROM alerts al ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const { rows } = await query(
      `SELECT al.*, a.severity, a.location_name, a.status AS accident_status
       FROM alerts al
       LEFT JOIN accidents a ON al.accident_id = a.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({
      success: true,
      data: { alerts: rows, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) { next(err); }
};

// ─── POST /alerts/send ────────────────────────────────────────────────────────
const sendAlert = async (req, res, next) => {
  try {
    const { accident_id, type, recipient_name, recipient_contact } = req.body;

    // Verify accident exists
    const accRes = await query('SELECT * FROM accidents WHERE id = $1', [accident_id]);
    if (!accRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Accident not found.' });
    }
    const accident = accRes.rows[0];

    // Create alert record as pending first
    const { rows } = await query(
      `INSERT INTO alerts (accident_id, type, recipient_name, recipient_contact, status)
       VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
      [accident_id, type, recipient_name || null, recipient_contact || null]
    );
    const alert = rows[0];

    let alertStatus = 'failed';
    let sentAt = null;

    if (type === 'email' && recipient_contact) {
      const subject = `[ARIS] ${accident.severity.toUpperCase()} Accident Alert — ${accident.location_name || 'Unknown Location'}`;
      const html = buildAccidentAlertHtml(accident);
      const result = await sendAlertEmail(recipient_contact, subject, html);
      if (result.success) { alertStatus = 'sent'; sentAt = new Date(); }
    } else if (type === 'system' || type === 'sms') {
      // system alerts are always "sent" (emitted via WS); SMS requires external gateway
      alertStatus = type === 'system' ? 'sent' : 'pending';
      if (type === 'system') sentAt = new Date();
    }

    // Update alert status
    const updated = await query(
      'UPDATE alerts SET status = $1, sent_at = $2 WHERE id = $3 RETURNING *',
      [alertStatus, sentAt, alert.id]
    );

    // WebSocket broadcast
    ws.broadcast('alert:sent', {
      alert: updated.rows[0],
      accident: { id: accident.id, severity: accident.severity, location_name: accident.location_name },
    });

    res.status(201).json({
      success: true,
      message: `Alert ${alertStatus}.`,
      data: { alert: updated.rows[0] },
    });
  } catch (err) { next(err); }
};

// ─── PUT /alerts/:id/status ───────────────────────────────────────────────────
const updateAlertStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['sent', 'failed', 'pending'].includes(status)) {
      return res.status(422).json({ success: false, message: 'Invalid status.' });
    }
    const sentAt = status === 'sent' ? 'NOW()' : 'NULL';
    const { rows } = await query(
      `UPDATE alerts SET status = $1, sent_at = ${sentAt} WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, message: 'Alert status updated.', data: { alert: rows[0] } });
  } catch (err) { next(err); }
};

module.exports = { getAllAlerts, sendAlert, updateAlertStatus };
