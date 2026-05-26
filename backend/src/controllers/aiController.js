'use strict';

const multer = require('multer');
const path   = require('path');
const aiService = require('../services/aiDetection');

// ─── Multer config ────────────────────────────────────────────────────────────
const storage = multer.memoryStorage(); // keep in memory (mock doesn't write to disk)

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── POST /ai/detect/image ────────────────────────────────────────────────────
const uploadMiddleware = upload.single('image');

const detectImage = async (req, res, next) => {
  try {
    // multer v2: upload.single() returns a promise
    await uploadMiddleware(req, res);

    if (!req.file && !req.body.image_data) {
      return res.status(400).json({
        success: false,
        message: 'Provide either a multipart image file (field: "image") or a base64 "image_data" field.',
      });
    }

    const filename = req.file ? req.file.originalname : 'base64_input';
    const result = await aiService.detectAccident({ filename });

    res.json({
      success: true,
      message: result.accident_detected ? 'Accident detected in image.' : 'No accident detected.',
      data: result,
    });
  } catch (err) { next(err); }
};

// ─── POST /ai/detect/frame ────────────────────────────────────────────────────
const detectFrame = async (req, res, next) => {
  try {
    const { frame_id, camera_id, timestamp } = req.body;

    if (!frame_id) {
      return res.status(400).json({ success: false, message: 'frame_id is required.' });
    }

    const result = await aiService.detectAccident({ frameId: frame_id });

    res.json({
      success: true,
      message: result.accident_detected ? 'Accident detected in frame.' : 'No accident detected in frame.',
      data: {
        ...result,
        camera_id:  camera_id  || null,
        timestamp:  timestamp  || new Date().toISOString(),
      },
    });
  } catch (err) { next(err); }
};

// ─── GET /ai/detect/health ────────────────────────────────────────────────────
const health = (_req, res) => {
  res.json({ success: true, data: aiService.getHealth() });
};

module.exports = { detectImage, detectFrame, health };
