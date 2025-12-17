const express = require('express');
const Role = require('../models/roles.model');
const router = express.Router();
const { getAllAccounts, deleteAccount, updateAccount, getMyAccount, changePassword, updateMyAccount, getHistoryByUser, getAccountByEmail } = require('../controllers/account.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/get-all-accounts', verifyToken, checkSessionTimeout, authorizeRole('admin'), getAllAccounts);

router.put('/delete-account', verifyToken, checkSessionTimeout, authorizeRole('admin'), deleteAccount);

router.put('/update-account/:userid', verifyToken, checkSessionTimeout, authorizeRole('admin'), updateAccount);

router.post('/change-password/:userid', verifyToken, checkSessionTimeout, changePassword);

router.put('/update-my-account', verifyToken, checkSessionTimeout, updateMyAccount);

router.get('/history/:userid', verifyToken, checkSessionTimeout, accountController.getAccountHistory);

router.get('/by-email/:email', verifyToken, checkSessionTimeout, authorizeRole(['admin', 'nurse']), getAccountByEmail);

router.get('/get-all-account-nurse', accountController.getAllAccountNurse);

router.get('/nurses-and-doctors', verifyToken, checkSessionTimeout, authorizeRole(['nurse', 'doctor', 'admin']), accountController.getAllNursesAndDoctors);

module.exports = router;