
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');
const { getUserNotifications, markOneAsReadByMessageId, getWarehouseNotifications } = require('../controllers/notification.controller');

router.get('/getMessage/:id', verifyToken, checkSessionTimeout, getUserNotifications);

router.put('/readMessage/:message_id', verifyToken, checkSessionTimeout, markOneAsReadByMessageId);

router.get('/warehouse', verifyToken, authorizeRole(['doctor', 'nurse']), checkSessionTimeout, getWarehouseNotifications);

module.exports = router;
