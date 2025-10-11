const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập và lấy JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 *                 token:
 *                   type: string
 *                   description: JWT Token dùng để xác thực
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Sai tên đăng nhập hoặc mật khẩu
 *       500:
 *         description: Lỗi server
 */
router.post('/login', authController.login);


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userid:
 *                 type: string
 *                 example: "U001"
 *               username:
 *                 type: string
 *                 example: "nguyenvana"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               email:
 *                 type: string
 *                 example: "vana@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0909123456"
 *               fullName:
 *                 type: string
 *                 example: "Nguyễn Văn A"
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
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc tài khoản đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/register', authController.register);


/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Xác thực tài khoản bằng token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token xác thực tài khoản (gửi qua email)
 *     responses:
 *       200:
 *         description: Tài khoản đã được kích hoạt
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.get('/verify/:token', authController.verifyAccount);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Gửi email quên mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email đặt lại mật khẩu đã được gửi
 *       404:
 *         description: Không tìm thấy tài khoản với email này
 *       500:
 *         description: Lỗi server
 */
router.post('/forgot-password', authController.forgotPassword);


/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Đặt lại mật khẩu mới
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token đặt lại mật khẩu (gửi qua email)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "654321"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi server
 */
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
