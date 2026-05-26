'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

const router = Router();
router.use(verifyToken);

router.get('/dashboard',      ctrl.dashboard);
router.get('/heatmap',        ctrl.heatmap);
router.get('/hourly',         ctrl.hourly);
router.get('/severity',       ctrl.severityAnalysis);
router.get('/response-times', ctrl.responseTimes);
router.get('/weekly',         ctrl.weekly);
router.get('/cities',         ctrl.cities);

module.exports = router;
