const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');
const shiftController = require('../controllers/shift.controller');

router.post('/createShift', verifyToken, checkSessionTimeout, authorizeRole(['admin']), shiftController.createShift);
router.get('/', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), shiftController.getShifts);
router.get('/my', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), shiftController.getMyShifts);
router.put('/updateShift/:shift_id', verifyToken, checkSessionTimeout, authorizeRole(['admin']), shiftController.updateShift);
router.put('/publishShift/:shift_id', verifyToken, checkSessionTimeout, authorizeRole(['admin']), shiftController.publishShift);
router.put('/assignUsers/:shift_id', verifyToken, checkSessionTimeout, authorizeRole(['admin']), shiftController.assignUsers);
router.delete('/cancelShift/:shift_id', verifyToken, checkSessionTimeout, authorizeRole(['admin']), shiftController.cancelShift);

module.exports = router;
