// routes/testResult.router.js
const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const testResultController = require('../controllers/testResult.controller');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.post('/createTestResult/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['doctor', 'nurse']), testResultController.createTestResult);

router.get('/getMyTestResults', verifyToken, checkSessionTimeout, testResultController.getMyTestResults);

router.get('/getAllTestResults', verifyToken, checkSessionTimeout, authorizeRole(['doctor', 'nurse', 'admin']), testResultController.getAllTestResults);

router.get('/getMyPerformedTestResults', verifyToken, checkSessionTimeout, authorizeRole(['doctor', 'nurse', 'admin']), testResultController.getMyPerformedTestResults);

router.get('/getTestResultByOrderCode/:order_code', verifyToken, checkSessionTimeout, testResultController.getTestResultByOrderCode);

router.post('/sendTestResultEmail/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['doctor', 'nurse', 'admin']), testResultController.sendTestResultEmail);



module.exports = router;