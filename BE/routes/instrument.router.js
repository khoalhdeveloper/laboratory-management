const express = require('express');
const router = express.Router();
const instrumentController = require('../controllers/intrusment.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');

router.get('/getAllinstrument', verifyToken, authorizeRole(['admin','doctor','serviceuser']), instrumentController.getAllInstruments);
router.get('/getinstrumentById/:id', verifyToken, authorizeRole(['admin','doctor','serviceuser']), instrumentController.getInstrumentById);
router.post('/createinstrument', verifyToken, authorizeRole(['admin','doctor','serviceuser']), instrumentController.createInstrument);
router.put('/updateinstrument/:id', verifyToken, authorizeRole(['admin','doctor','serviceuser']), instrumentController.updateInstrument);
router.delete('/deleteinstrument/:id', verifyToken, authorizeRole(['admin','doctor','serviceuser']), instrumentController.deleteInstrument);


module.exports = router;
