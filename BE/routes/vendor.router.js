const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/getAllVendors', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse','serviceuser']), vendorController.getAllVendors);

router.get('/getVendorById/:vendor_id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse','serviceuser']), vendorController.getVendorById);

router.post('/createVendor', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), vendorController.createVendor);

router.put('/updateVendor/:vendor_id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), vendorController.updateVendor);

router.delete('/deleteVendor/:vendor_id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), vendorController.deleteVendor);



module.exports = router;