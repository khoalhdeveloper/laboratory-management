const express = require('express');
const router = express.Router();
const reagentSupplyController = require('../controllers/reagentSupply.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');




router.get('/getAllSupplyRecords', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentSupplyController.getAllSupplyRecords);

router.get('/getSupplyRecordById/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentSupplyController.getSupplyRecordById);

router.post('/createSupplyRecord', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentSupplyController.createSupplyRecord);

router.put('/updateSupplyRecord/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentSupplyController.updateSupplyRecord);

router.delete('/deleteSupplyRecord/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentSupplyController.deleteSupplyRecord);


module.exports = router;