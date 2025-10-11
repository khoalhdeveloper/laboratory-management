const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Lấy thông tin tài khoản của chính user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
  '/me',
  verifyToken, // chỉ cần xác thực, không cần authorizeRole
  accountController.getMyAccount
);
// User chỉ xem được chính họ
router.get('/my-account', verifyToken, accountController.getMyAccount);

module.exports = router;
