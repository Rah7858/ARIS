'use strict';

const { query } = require('../config/database');

// ─── GET /analytics/dashboard ─────────────────────────────────────────────────
const dashboard = async (req, res, next) => {
  try {
    const [
      totalAccidents, liveAccidents, totalCameras, activeCameras,
      severityDist, statusDist, recentAccidents, alertStats
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM accidents'),
      query("SELECT COUNT(*) FROM accidents WHERE status IN ('detected','responding')"),
      query('SELECT COUNT(*) FROM cameras'),
      query("SELECT COUNT(*) FROM cameras WHERE status = 'active'"),
      query('SELECT severity, COUNT(*) AS count FROM accidents GROUP BY severity ORDER BY CASE severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 ELSE 4 END'),
      query('SELECT status, COUNT(*) AS count FROM accidents GROUP BY status'),
      query(`SELECT a.id, a.severity, a.status, a.location_name, a.detected_at, c.city
             FROM accidents a LEFT JOIN cameras c ON a.camera_id = c.id
             ORDER BY a.detected_at DESC LIMIT 5`),
      query('SELECT status, COUNT(*) AS count FROM alerts GROUP BY status'),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total_accidents: parseInt(totalAccidents.rows[0].count),
          live_accidents:  parseInt(liveAccidents.rows[0].count),
          total_cameras:   parseInt(totalCameras.rows[0].count),
          active_cameras:  parseInt(activeCameras.rows[0].count),
        },
        severity_distribution: severityDist.rows.map(r => ({ severity: r.severity, count: parseInt(r.count) })),
        status_distribution:   statusDist.rows.map(r => ({ status: r.status, count: parseInt(r.count) })),
        recent_accidents:      recentAccidents.rows,
        alert_summary:         alertStats.rows.reduce((acc, r) => { acc[r.status] = parseInt(r.count); return acc; }, {}),
        generated_at:          new Date().toISOString(),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /analytics/heatmap ───────────────────────────────────────────────────
const heatmap = async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT
         a.latitude, a.longitude, a.severity, a.location_name,
         COUNT(*) OVER (PARTITION BY ROUND(a.latitude::numeric,2), ROUND(a.longitude::numeric,2)) AS cluster_count,
         c.city
       FROM accidents a
       LEFT JOIN cameras c ON a.camera_id = c.id
       WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
       ORDER BY cluster_count DESC`
    );
    res.json({ success: true, data: { points: rows, count: rows.length } });
  } catch (err) { next(err); }
};

// ─── GET /analytics/hourly ────────────────────────────────────────────────────
const hourly = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const { rows } = await query(
      `SELECT
         EXTRACT(HOUR FROM detected_at) AS hour,
         COUNT(*) AS count,
         COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
         COUNT(*) FILTER (WHERE severity = 'high')     AS high,
         COUNT(*) FILTER (WHERE severity = 'medium')   AS medium,
         COUNT(*) FILTER (WHERE severity = 'low')      AS low
       FROM accidents
       WHERE detected_at >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY hour
       ORDER BY hour`,
      []
    );
    // Fill missing hours with zeros
    const hourMap = {};
    rows.forEach(r => { hourMap[parseInt(r.hour)] = r; });
    const full = Array.from({ length: 24 }, (_, h) => hourMap[h] || {
      hour: h, count: '0', critical: '0', high: '0', medium: '0', low: '0',
    }).map(r => ({
      hour:     parseInt(r.hour),
      count:    parseInt(r.count),
      critical: parseInt(r.critical),
      high:     parseInt(r.high),
      medium:   parseInt(r.medium),
      low:      parseInt(r.low),
    }));

    res.json({ success: true, data: { hourly: full, days_range: parseInt(days) } });
  } catch (err) { next(err); }
};

// ─── GET /analytics/severity ──────────────────────────────────────────────────
const severityAnalysis = async (req, res, next) => {
  try {
    const [dist, trend, byCity] = await Promise.all([
      query(`SELECT severity, COUNT(*) AS total,
               COUNT(*) FILTER (WHERE status = 'resolved') AS resolved,
               COUNT(*) FILTER (WHERE status IN ('detected','responding')) AS active
             FROM accidents GROUP BY severity
             ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`),
      query(`SELECT DATE(detected_at) AS date, severity, COUNT(*) AS count
             FROM accidents
             WHERE detected_at >= NOW() - INTERVAL '30 days'
             GROUP BY DATE(detected_at), severity
             ORDER BY date`),
      query(`SELECT c.city, a.severity, COUNT(*) AS count
             FROM accidents a LEFT JOIN cameras c ON a.camera_id = c.id
             WHERE c.city IS NOT NULL
             GROUP BY c.city, a.severity
             ORDER BY c.city, CASE a.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`),
    ]);

    res.json({
      success: true,
      data: {
        distribution: dist.rows.map(r => ({
          severity: r.severity,
          total:    parseInt(r.total),
          resolved: parseInt(r.resolved),
          active:   parseInt(r.active),
        })),
        trend_30d: trend.rows.map(r => ({ date: r.date, severity: r.severity, count: parseInt(r.count) })),
        by_city:   byCity.rows.map(r => ({ city: r.city, severity: r.severity, count: parseInt(r.count) })),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /analytics/response-times ───────────────────────────────────────────
const responseTimes = async (req, res, next) => {
  try {
    const [avgBySeverity, avgByCity, incidents] = await Promise.all([
      query(`SELECT severity,
               ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - detected_at))/60),2) AS avg_minutes,
               COUNT(*) FILTER (WHERE resolved_at IS NOT NULL) AS resolved_count
             FROM accidents
             WHERE resolved_at IS NOT NULL
             GROUP BY severity
             ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`),
      query(`SELECT c.city,
               ROUND(AVG(EXTRACT(EPOCH FROM (a.resolved_at - a.detected_at))/60),2) AS avg_minutes,
               COUNT(*) AS resolved_count
             FROM accidents a LEFT JOIN cameras c ON a.camera_id = c.id
             WHERE a.resolved_at IS NOT NULL AND c.city IS NOT NULL
             GROUP BY c.city ORDER BY avg_minutes`),
      query(`SELECT ROUND(AVG(i.response_time),2) AS avg_responder_time,
               MIN(i.response_time) AS min_time, MAX(i.response_time) AS max_time,
               COUNT(*) AS total_incidents
             FROM incidents i WHERE i.response_time IS NOT NULL`),
    ]);

    res.json({
      success: true,
      data: {
        by_severity: avgBySeverity.rows.map(r => ({ ...r, avg_minutes: parseFloat(r.avg_minutes) })),
        by_city:     avgByCity.rows.map(r => ({ ...r, avg_minutes: parseFloat(r.avg_minutes) })),
        responder_stats: {
          avg_response_time_mins: parseFloat(incidents.rows[0].avg_responder_time),
          min_mins: incidents.rows[0].min_time,
          max_mins: incidents.rows[0].max_time,
          total_incidents: parseInt(incidents.rows[0].total_incidents),
        },
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /analytics/weekly ────────────────────────────────────────────────────
const weekly = async (req, res, next) => {
  try {
    const { weeks = 8 } = req.query;
    const { rows } = await query(
      `SELECT
         DATE_TRUNC('week', detected_at) AS week_start,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
         COUNT(*) FILTER (WHERE severity = 'high')     AS high,
         COUNT(*) FILTER (WHERE status  = 'resolved')  AS resolved
       FROM accidents
       WHERE detected_at >= NOW() - INTERVAL '${parseInt(weeks)} weeks'
       GROUP BY week_start
       ORDER BY week_start`
    );
    res.json({
      success: true,
      data: {
        weekly: rows.map(r => ({
          week_start: r.week_start,
          total:      parseInt(r.total),
          critical:   parseInt(r.critical),
          high:       parseInt(r.high),
          resolved:   parseInt(r.resolved),
        })),
        weeks_range: parseInt(weeks),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /analytics/cities ────────────────────────────────────────────────────
const cities = async (req, res, next) => {
  try {
    const { rows } = await query(
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

module.exports = { dashboard, heatmap, hourly, severityAnalysis, responseTimes, weekly, cities };
