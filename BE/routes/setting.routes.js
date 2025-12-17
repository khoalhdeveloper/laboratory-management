const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');
const {getSettings, updateSettings} = require('../controllers/setting.controller');



router.get('/getConfig', verifyToken, authorizeRole('admin'), checkSessionTimeout, getSettings);

router.put('/updateConfig', verifyToken, authorizeRole('admin'), checkSessionTimeout, updateSettings);


module.exports = router;
