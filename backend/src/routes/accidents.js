'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/accidentController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateAccident, validateAccidentStatus, validateUUIDParam } = require('../middleware/validate');

const router = Router();
router.use(verifyToken);

// Special routes BEFORE /:id to avoid param conflicts
router.get('/live',  ctrl.getLiveAccidents);
router.get('/stats', ctrl.getAccidentStats);

router.get( '/',          ctrl.getAllAccidents);
router.get( '/:id',       validateUUIDParam('id'), ctrl.getAccidentById);
router.post('/',          requireRole('admin', 'operator'), validateAccident, ctrl.createAccident);
router.put( '/:id/status', requireRole('admin', 'operator'), validateUUIDParam('id'), validateAccidentStatus, ctrl.updateAccidentStatus);
router.delete('/:id',     requireRole('admin'),              validateUUIDParam('id'), ctrl.deleteAccident);

module.exports = router;
