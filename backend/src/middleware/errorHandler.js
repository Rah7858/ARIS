'use strict';

/**
 * Global 404 handler — must be registered AFTER all routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error handler — must be the last middleware (4-arg signature).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);

  // PostgreSQL unique-violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. Resource already exists.',
      detail: err.detail || undefined,
    });
  }

  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced resource not found.',
      detail: err.detail || undefined,
    });
  }

  // Multer file-size errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Uploaded file is too large.',
    });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error.';

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
