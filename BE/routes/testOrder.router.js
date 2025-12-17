const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const testOrderController = require('../controllers/testOrder.controller');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/getMyTestOrders', verifyToken, checkSessionTimeout, testOrderController.getMyTestOrders);

router.post('/recordTestOrder', verifyToken, checkSessionTimeout, authorizeRole(['nurse', 'admin']), testOrderController.createTestOrderForUser);

router.get('/getCreatedTestOrders', verifyToken, checkSessionTimeout, authorizeRole(['nurse', 'admin']), testOrderController.getCreatedTestOrders);

router.put('/updateTestOrder/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['nurse', 'admin']), testOrderController.updateTestOrder);

router.delete('/deleteTestOrder/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['nurse', 'admin']), testOrderController.deleteTestOrder);

router.put('/updateTestOrderStatus/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['doctor', 'nurse', 'admin']), testOrderController.updateTestOrderStatus);

router.get('/getTestOrderByCode/:order_code', verifyToken, checkSessionTimeout, testOrderController.getTestOrderByCode);

router.get('/getAllTestOrders', verifyToken, checkSessionTimeout, authorizeRole(['admin','nurse']),testOrderController.getAllTestOrders);

module.exports = router;