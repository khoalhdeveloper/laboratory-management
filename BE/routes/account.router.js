const express = require('express');
const router = express.Router();
const { getAllAccounts, deleteAccount, updateAccount, getMyAccount, changePassword,updateMyAccount  } = require('../controllers/account.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         userid:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         fullName:
 *           type: string
 *         identifyNumber:
 *           type: string
 *         age:
 *           type: integer
 *         address:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         role:
 *           type: string
 */
/**

/**
 * @swagger
 * /api/admin/accounts/get-all-accounts:
 *   get:
 *     summary: Lấy danh sách tất cả account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 */
router.get('/get-all-accounts', verifyToken, authorizeRole('admin'), getAllAccounts);

/**
 * @swagger
 * /api/admin/accounts/delete-account:
 *   put:
 *     summary: Xóa (hoặc vô hiệu hóa) account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.put('/delete-account', verifyToken, authorizeRole('admin'), deleteAccount);

/**
 * @swagger
 * /api/admin/accounts/update-account/{userid}:
 *   put:
 *     summary: Cập nhật account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/update-account/:userid', verifyToken, authorizeRole('admin'), updateAccount);


/**
 * @swagger
 * /api/admin/accounts/change-password/{userid}:
 *   post:
 *     summary: Đổi mật khẩu cho tài khoản
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: UserID của tài khoản cần đổi mật khẩu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Mật khẩu cũ
 *               newPassword:
 *                 type: string
 *                 description: Mật khẩu mới
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không đúng
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.post('/change-password/:userid', changePassword);

/**
 * @swagger
 * /api/accounts/update-my-account:
 *   put:
 *     summary: Cập nhật thông tin tài khoản của chính mình (User)
 *     description: Người dùng cập nhật thông tin cá nhân của chính mình. Nếu là Admin, có thể cập nhật thêm role và trạng thái.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: nguyenvana
 *               image:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "0909123456"
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               identifyNumber:
 *                 type: string
 *                 example: "123456789"
 *               age:
 *                 type: integer
 *                 example: 24
 *               address:
 *                 type: string
 *                 example: "An Giang, Việt Nam"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2001-05-17"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật tài khoản thành công"
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 *       400:
 *         description: Không tìm thấy userId trong token
 *       403:
 *         description: Bạn không có quyền cập nhật tài khoản này
 *       404:
 *         description: Không tìm thấy tài khoản
 */
router.put('/update-my-account', verifyToken, updateMyAccount);


module.exports = router;
