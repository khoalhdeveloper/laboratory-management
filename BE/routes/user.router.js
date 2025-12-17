const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/me', verifyToken, checkSessionTimeout, accountController.getMyAccount);

router.get('/my-account', verifyToken, checkSessionTimeout, accountController.getMyAccount);


module.exports = router;