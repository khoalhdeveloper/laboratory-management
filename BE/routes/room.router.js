const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');

// Public routes (for viewing room availability)
router.get('/public', roomController.getRooms);
router.get('/statistics', roomController.getRoomStatistics);

// Protected routes - require authentication
router.use(verifyToken);
router.use(checkSessionTimeout);

// Room management routes
router.get('/', roomController.getRooms);
router.get('/:roomNumber', roomController.getRoomByNumber);

// Admin/Doctor only routes
router.post('/', authorizeRole(['admin', 'doctor']), roomController.createRoom);
router.put('/:roomNumber', authorizeRole(['admin', 'doctor']), roomController.updateRoom);
router.delete('/:roomNumber', authorizeRole(['admin', 'doctor']), roomController.deleteRoom);

// Patient management in rooms
router.post('/:roomNumber/patients', authorizeRole(['admin', 'doctor', 'nurse']), roomController.addPatientToRoom);
router.delete('/:roomNumber/patients/:patientId', authorizeRole(['admin', 'doctor', 'nurse']), roomController.removePatientFromRoom);
router.put('/:roomNumber/patients/:patientId', authorizeRole(['admin', 'doctor', 'nurse']), roomController.updatePatientInRoom);

module.exports = router;