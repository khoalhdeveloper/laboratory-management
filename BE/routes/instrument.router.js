const express = require('express');
const router = express.Router();
const instrumentController = require('../controllers/intrusment.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/getAllinstrument', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser','nurse']), instrumentController.getAllInstruments);

router.get('/getinstrumentById/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser','nurse']), instrumentController.getInstrumentById);

router.get('/getTestHistory/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser']), instrumentController.getInstrumentTestHistory);

router.post('/createinstrument', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser']), instrumentController.createInstrument);

router.put('/updateinstrument/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser']), instrumentController.updateInstrument);

router.delete('/deleteinstrument/:id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','serviceuser']), instrumentController.deleteInstrument);


module.exports = router;