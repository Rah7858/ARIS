'use strict';

const { query } = require('../config/database');

// ─── GET /emergency-contacts ──────────────────────────────────────────────────
const getAllContacts = async (req, res, next) => {
  try {
    const { city, type, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (city) { conditions.push(`city ILIKE $${idx++}`); params.push(`%${city}%`); }
    if (type) { conditions.push(`type = $${idx++}`);     params.push(type); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const countRes = await query(`SELECT COUNT(*) FROM emergency_contacts ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const { rows } = await query(
      `SELECT * FROM emergency_contacts ${where}
       ORDER BY city, type, name
       LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({
      success: true,
      data: {
        contacts: rows,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /emergency-contacts/city/:city ───────────────────────────────────────
const getContactsByCity = async (req, res, next) => {
  try {
    const { city } = req.params;
    const { rows } = await query(
      `SELECT * FROM emergency_contacts WHERE city ILIKE $1 ORDER BY type, name`,
      [`%${city}%`]
    );
    res.json({
      success: true,
      data: {
        city,
        contacts: rows,
        count: rows.length,
        by_type: rows.reduce((acc, c) => {
          if (!acc[c.type]) acc[c.type] = [];
          acc[c.type].push(c);
          return acc;
        }, {}),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /emergency-contacts/:id ──────────────────────────────────────────────
const getContactById = async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM emergency_contacts WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, data: { contact: rows[0] } });
  } catch (err) { next(err); }
};

// ─── POST /emergency-contacts ─────────────────────────────────────────────────
const createContact = async (req, res, next) => {
  try {
    const { name, type, phone, email, city, latitude, longitude, response_time_avg } = req.body;
    const { rows } = await query(
      `INSERT INTO emergency_contacts (name, type, phone, email, city, latitude, longitude, response_time_avg)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, type, phone, email || null, city, latitude || null, longitude || null, response_time_avg || null]
    );
    res.status(201).json({ success: true, message: 'Contact created.', data: { contact: rows[0] } });
  } catch (err) { next(err); }
};

// ─── PUT /emergency-contacts/:id ──────────────────────────────────────────────
const updateContact = async (req, res, next) => {
  try {
    const { name, type, phone, email, city, latitude, longitude, response_time_avg } = req.body;
    const { rows } = await query(
      `UPDATE emergency_contacts SET
         name              = COALESCE($1, name),
         type              = COALESCE($2, type),
         phone             = COALESCE($3, phone),
         email             = COALESCE($4, email),
         city              = COALESCE($5, city),
         latitude          = COALESCE($6, latitude),
         longitude         = COALESCE($7, longitude),
         response_time_avg = COALESCE($8, response_time_avg)
       WHERE id = $9 RETURNING *`,
      [name, type, phone, email, city, latitude, longitude, response_time_avg, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, message: 'Contact updated.', data: { contact: rows[0] } });
  } catch (err) { next(err); }
};

// ─── DELETE /emergency-contacts/:id ──────────────────────────────────────────
const deleteContact = async (req, res, next) => {
  try {
    const { rows } = await query('DELETE FROM emergency_contacts WHERE id = $1 RETURNING id', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.json({ success: true, message: 'Contact deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAllContacts, getContactsByCity, getContactById, createContact, updateContact, deleteContact };
