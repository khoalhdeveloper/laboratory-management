const express = require("express");
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRole } = require('../middlewares/auth.middleware');
const { getAllLogs, getDoctorLogs } = require("../controllers/eventLog.controller");
const { checkSessionTimeout } = require("../middlewares/session.middleware");



router.get('/getAllLog', verifyToken, checkSessionTimeout, authorizeRole(['admin']), getAllLogs);

router.get('/getDoctorLog', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), getDoctorLogs);


module.exports = router;
