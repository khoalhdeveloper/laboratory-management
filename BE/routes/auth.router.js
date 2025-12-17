const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');



router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/verify/:token', authController.verifyAccount);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.post('/google', authController.googleLogin);

module.exports = router;