'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/alertController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateAlert, validateUUIDParam } = require('../middleware/validate');

const router = Router();
router.use(verifyToken);

router.get( '/',              ctrl.getAllAlerts);
router.post('/send',          requireRole('admin', 'operator'), validateAlert, ctrl.sendAlert);
router.put( '/:id/status',   requireRole('admin', 'operator'), validateUUIDParam('id'), ctrl.updateAlertStatus);

module.exports = router;
