const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const testOrderController = require('../controllers/testOrder.controller');

/**
 * @swagger
 * tags:
 *   name: Test Orders
 *   description: API quản lý phiếu xét nghiệm
 */

/**
 * @swagger
 * /api/test-orders/my-orders:
 *   get:
 *     summary: Lấy danh sách test order của người dùng hiện tại
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/my-orders', verifyToken, testOrderController.getMyTestOrders);

/**
 * @swagger
 * /api/test-orders/record:
 *   post:
 *     summary: Nurse hoặc Admin ghi nhận test order cho bệnh nhân (user)
 *     description: Chỉ user có role **nurse** hoặc **admin** mới được phép tạo phiếu xét nghiệm cho bệnh nhân.
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - patient_name
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID của bệnh nhân (user)
 *                 example: 68e0e94317fd621011fb3d8a
 *               created_by:
 *                 type: string
 *                 description: ID của người tạo đơn (nurse/admin)
 *                 example: nurse
 *               order_code:
 *                 type: string
 *                 description: Mã đơn xét nghiệm (tự sinh nếu không nhập)
 *                 example: ORD-20251007
 *               patient_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               gender:
 *                 type: string
 *                 example: male
 *               age:
 *                 type: number
 *                 example: 25
 *               address:
 *                 type: string
 *                 example: An Giang, Vietnam
 *               phone_number:
 *                 type: string
 *                 example: 0909123456
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               status:
 *                 type: string
 *                 example: pending
 *               priority:
 *                 type: string
 *                 example: normal
 *               test_type:
 *                 type: string
 *                 example: Blood Test
 *               notes:
 *                 type: string
 *                 example: Khám định kỳ 6 tháng/lần
 *     responses:
 *       201:
 *         description: Ghi nhận test order thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Nurse đã ghi nhận test order thành công
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       403:
 *         description: Không có quyền truy cập (chỉ nurse/admin)
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.post(
  '/record',
  verifyToken,
  authorizeRole(['nurse', 'admin']),
  testOrderController.createTestOrderForUser
);

/**
 * @swagger
 * /api/test-orders/created-by-me:
 *   get:
 *     summary: Nurse hoặc Admin xem danh sách test orders do mình tạo
 *     description: Trả về danh sách các test order được tạo bởi nurse/admin đang đăng nhập.
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách test orders thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách test orders do nurse tạo thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestOrder'
 *       403:
 *         description: Không có quyền truy cập (chỉ nurse/admin)
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.get(
  '/created-by-me',
  verifyToken,
  authorizeRole(['nurse', 'admin']),
  testOrderController.getCreatedTestOrders
);

/**
 * @swagger
 * components:
 *   schemas:
 *     TestOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6711219e0c71a1b65a2db3d5
 *         user_id:
 *           type: string
 *           example: 68e0e94317fd621011fb3d8a
 *         created_by:
 *           type: string
 *           example: 6710f8439d5c123456789012
 *         order_code:
 *           type: string
 *           example: ORD-20251007
 *         patient_name:
 *           type: string
 *           example: Nguyen Van A
 *         gender:
 *           type: string
 *           example: male
 *         status:
 *           type: string
 *           example: pending
 *         priority:
 *           type: string
 *           example: high
 *         test_type:
 *           type: string
 *           example: Blood Test
 *         notes:
 *           type: string
 *           example: Bệnh nhân đã lấy mẫu và chờ kết quả
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/test-orders/{id}:
 *   put:
 *     summary: Nurse hoặc Admin cập nhật test order
 *     description: |
 *       - **Nurse** chỉ được cập nhật test orders *do chính họ tạo (created_by)*  
 *       - **Admin** có thể cập nhật tất cả test orders  
 *       - Có thể cập nhật **bất kỳ field nào**, bao gồm cả patient info, priority, test_type, status, v.v.
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của test order cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestOrder'
 *           example:
 *             patient_name: Nguyen Van B
 *             gender: female
 *             age: 30
 *             address: Ha Noi, Vietnam
 *             phone_number: "0987654321"
 *             email: userb@example.com
 *             test_type: Urine Test
 *             priority: normal
 *             status: processing
 *             notes: Bệnh nhân kiểm tra lại sau 1 tuần
 *     responses:
 *       200:
 *         description: Cập nhật test order thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cập nhật test order thành công
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *       403:
 *         description: Không có quyền chỉnh sửa test order này (chỉ nurse/admin)
 *       404:
 *         description: Không tìm thấy test order
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', verifyToken, authorizeRole(['nurse', 'admin']), testOrderController.updateTestOrder);




/**
 * @swagger
 * /api/test-orders/{id}:
 *   delete:
 *     summary: Nurse hoặc Admin xóa test order
 *     description: |
 *       - **Nurse** chỉ được phép xóa các test orders *do chính họ tạo (created_by)*  
 *       - **Admin** có thể xóa **mọi** test order trong hệ thống  
 *       - Khi xóa thành công, test order sẽ bị loại bỏ hoàn toàn khỏi cơ sở dữ liệu
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của test order cần xóa
 *         example: 6711219e0c71a1b65a2db3d5
 *     responses:
 *       200:
 *         description: Xóa test order thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Xóa test order thành công
 *       403:
 *         description: Không có quyền xóa test order này (chỉ nurse/admin)
 *       404:
 *         description: Không tìm thấy test order
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', verifyToken, authorizeRole(['nurse', 'admin']), testOrderController.deleteTestOrder);
/**
 * @swagger
 * /api/test-orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái test order (doctor hoặc nurse)
 *     description: |
 *       - **Doctor** có thể cập nhật trạng thái của mọi test order.  
 *       - **Nurse** chỉ có thể cập nhật các test orders *do mình tạo (created_by)*.  
 *       - Các trạng thái hợp lệ gồm: `pending`, `processing`, `completed`, `cancelled`.
 *     tags: [Test Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của test order cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: completed
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cập nhật trạng thái test order thành công
 *                 data:
 *                   $ref: '#/components/schemas/TestOrder'
 *       400:
 *         description: Thiếu thông tin trạng thái
 *       403:
 *         description: Không có quyền cập nhật
 *       404:
 *         description: Không tìm thấy test order
 *       500:
 *         description: Lỗi server
 */
router.put('/:id/status', verifyToken, authorizeRole(['doctor', 'nurse', 'admin']), testOrderController.updateTestOrderStatus);


module.exports = router;
