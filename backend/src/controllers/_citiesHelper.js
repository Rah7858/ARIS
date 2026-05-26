'use strict';

const { query } = require('../config/database');
const db = require('../config/database');

// ─── GET /analytics/cities — clean version ────────────────────────────────────
const cities = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT
         cam.city,
         COUNT(a.id)                                          AS total_accidents,
         COUNT(a.id) FILTER (WHERE a.severity = 'critical')  AS critical,
         COUNT(a.id) FILTER (WHERE a.severity = 'high')      AS high,
         COUNT(a.id) FILTER (WHERE a.severity = 'medium')    AS medium,
         COUNT(a.id) FILTER (WHERE a.severity = 'low')       AS low,
         COUNT(a.id) FILTER (WHERE a.status = 'resolved')    AS resolved,
         COUNT(a.id) FILTER (WHERE a.status IN ('detected','responding')) AS active,
         ROUND(AVG(EXTRACT(EPOCH FROM (a.resolved_at - a.detected_at))/60),2) AS avg_resolution_mins,
         COUNT(DISTINCT cam.id) AS camera_count
       FROM cameras cam
       LEFT JOIN accidents a ON a.camera_id = cam.id
       GROUP BY cam.city
       ORDER BY total_accidents DESC`
    );

    res.json({
      success: true,
      data: {
        cities: rows.map(r => ({
          city:               r.city,
          total_accidents:    parseInt(r.total_accidents),
          critical:           parseInt(r.critical),
          high:               parseInt(r.high),
          medium:             parseInt(r.medium),
          low:                parseInt(r.low),
          resolved:           parseInt(r.resolved),
          active:             parseInt(r.active),
          avg_resolution_mins: r.avg_resolution_mins ? parseFloat(r.avg_resolution_mins) : null,
          camera_count:       parseInt(r.camera_count),
        })),
      },
    });
  } catch (err) { next(err); }
};

module.exports = { cities };
