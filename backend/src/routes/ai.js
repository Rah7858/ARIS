'use strict';

const { Router } = require('express');
const { detectImage, detectFrame, health } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

const router = Router();
router.use(verifyToken);

router.post('/detect/image',  detectImage);   // multipart/form-data OR JSON {image_data}
router.post('/detect/frame',  detectFrame);   // JSON {frame_id, camera_id, timestamp}
router.get( '/detect/health', health);

module.exports = router;
