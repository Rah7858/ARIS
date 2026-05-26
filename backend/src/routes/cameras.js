'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/cameraController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateCamera, validateUUIDParam } = require('../middleware/validate');

const router = Router();

// All camera routes require authentication
router.use(verifyToken);

router.get( '/',          ctrl.getAllCameras);
router.get( '/:id',       validateUUIDParam('id'), ctrl.getCameraById);
router.post('/',          requireRole('admin', 'operator'), validateCamera, ctrl.createCamera);
router.put( '/:id',       requireRole('admin', 'operator'), validateUUIDParam('id'), validateCamera, ctrl.updateCamera);
router.delete('/:id',     requireRole('admin'),             validateUUIDParam('id'), ctrl.deleteCamera);
router.patch('/:id/status', requireRole('admin', 'operator'), validateUUIDParam('id'), ctrl.toggleCameraStatus);

module.exports = router;
