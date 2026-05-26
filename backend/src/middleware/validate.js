'use strict';

const { body, param, query, validationResult } = require('express-validator');

/**
 * Run express-validator results and return 422 if errors exist.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain a number.'),
  body('role').optional().isIn(['admin', 'operator', 'viewer']).withMessage('Invalid role.'),
  body('phone').optional().trim().isLength({ max: 20 }),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidation,
];

// ─── Cameras ──────────────────────────────────────────────────────────────────
const validateCamera = [
  body('name').trim().notEmpty().withMessage('Camera name is required.').isLength({ max: 100 }),
  body('location').trim().notEmpty().withMessage('Location is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required.'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required.'),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']).withMessage('Invalid status.'),
  body('stream_url').optional().trim(),
  handleValidation,
];

// ─── Accidents ────────────────────────────────────────────────────────────────
const validateAccident = [
  body('camera_id').optional().isUUID().withMessage('camera_id must be a valid UUID.'),
  body('severity').isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid severity.'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('location_name').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('vehicle_count').optional().isInt({ min: 0 }).withMessage('vehicle_count must be non-negative.'),
  handleValidation,
];

const validateAccidentStatus = [
  body('status').isIn(['detected', 'responding', 'resolved']).withMessage('Invalid status.'),
  handleValidation,
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
const validateAlert = [
  body('accident_id').isUUID().withMessage('accident_id must be a valid UUID.'),
  body('type').isIn(['email', 'sms', 'system']).withMessage('Invalid alert type.'),
  body('recipient_name').optional().trim().isLength({ max: 100 }),
  body('recipient_contact').optional().trim().isLength({ max: 255 }),
  handleValidation,
];

// ─── Emergency Contacts ───────────────────────────────────────────────────────
const validateEmergencyContact = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 150 }),
  body('type').isIn(['police', 'hospital', 'ambulance', 'fire']).withMessage('Invalid type.'),
  body('phone').trim().notEmpty().withMessage('Phone is required.'),
  body('email').optional().isEmail().normalizeEmail(),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('response_time_avg').optional().isInt({ min: 0 }),
  handleValidation,
];

// ─── UUID param ───────────────────────────────────────────────────────────────
const validateUUIDParam = (paramName = 'id') => [
  param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID.`),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCamera,
  validateAccident,
  validateAccidentStatus,
  validateAlert,
  validateEmergencyContact,
  validateUUIDParam,
  handleValidation,
};
