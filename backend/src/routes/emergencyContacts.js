'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/emergencyContactController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateEmergencyContact, validateUUIDParam } = require('../middleware/validate');

const router = Router();
router.use(verifyToken);

router.get( '/city/:city',  ctrl.getContactsByCity);
router.get( '/',            ctrl.getAllContacts);
router.get( '/:id',         validateUUIDParam('id'), ctrl.getContactById);
router.post('/',            requireRole('admin', 'operator'), validateEmergencyContact, ctrl.createContact);
router.put( '/:id',         requireRole('admin', 'operator'), validateUUIDParam('id'), validateEmergencyContact, ctrl.updateContact);
router.delete('/:id',       requireRole('admin'),             validateUUIDParam('id'), ctrl.deleteContact);

module.exports = router;
