'use strict';

const transporter = require('../config/mailer');

/**
 * Send an alert email.
 * @param {string} to       - Recipient email address
 * @param {string} subject  - Email subject
 * @param {string} html     - HTML body content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendAlertEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ARIS System" <noreply@aris.local>',
      to,
      subject,
      html,
    });
    console.log(`[MAILER] Email sent to ${to} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[MAILER] Failed to send email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Build a rich HTML email for an accident alert.
 * @param {object} accident
 * @returns {string} HTML string
 */
function buildAccidentAlertHtml(accident) {
  const severityColors = {
    critical: '#dc2626',
    high:     '#ea580c',
    medium:   '#ca8a04',
    low:      '#16a34a',
  };
  const color = severityColors[accident.severity] || '#6b7280';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    <div style="background:#1e293b;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🚨 ARIS — Accident Alert</h1>
    </div>
    <div style="padding:24px;">
      <div style="background:${color}15;border-left:4px solid ${color};padding:16px;border-radius:4px;margin-bottom:20px;">
        <span style="color:${color};font-weight:bold;font-size:18px;text-transform:uppercase;">${accident.severity} Severity</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;color:#6b7280;width:140px;">Location</td><td style="padding:8px;font-weight:500;">${accident.location_name || 'N/A'}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Status</td><td style="padding:8px;font-weight:500;text-transform:capitalize;">${accident.status}</td></tr>
        <tr><td style="padding:8px;color:#6b7280;">Vehicles Involved</td><td style="padding:8px;font-weight:500;">${accident.vehicle_count || 0}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px;color:#6b7280;">Detected At</td><td style="padding:8px;font-weight:500;">${new Date(accident.detected_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
        ${accident.description ? `<tr><td style="padding:8px;color:#6b7280;">Description</td><td style="padding:8px;">${accident.description}</td></tr>` : ''}
      </table>
    </div>
    <div style="background:#f8fafc;padding:16px;text-align:center;color:#94a3b8;font-size:12px;">
      This is an automated alert from the ARIS — Accident Response Intelligence System.<br/>
      Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;
}

module.exports = { sendAlertEmail, buildAccidentAlertHtml };
