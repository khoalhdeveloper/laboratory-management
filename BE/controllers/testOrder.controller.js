const mongoose = require('mongoose');
const TestOrderModel = require('../models/testOrder.model');

// 🧩 USER xem test orders của chính mình
exports.getMyTestOrders = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const testOrders = await TestOrderModel.find({ user_id: userId })
      .sort({ created_at: -1 });

    res.status(200).json({
      message: 'Lấy danh sách test orders thành công',
      data: testOrders,
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy test orders:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// 👩‍⚕️ NURSE hoặc ADMIN ghi nhận test order cho bệnh nhân
exports.createTestOrderForUser = async (req, res) => {
  try {
    const currentUser = req.user;
    const nurseId = currentUser?.userId;
    const role = currentUser?.role;

    // Chỉ cho phép nurse hoặc admin
    if (!nurseId || (role !== 'nurse' && role !== 'admin')) {
      return res.status(403).json({
        message: 'Access denied. Only nurse or admin can create test orders.'
      });
    }

    const {
      user_id,
      order_code,
      patient_name,
      date_of_birth,
      gender,
      age,
      address,
      phone_number,
      email,
      status,
      priority,
      test_type,
      notes
    } = req.body;

    if (!user_id || !patient_name) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: user_id, patient_name'
      });
    }

    // ✅ Ghi lại người tạo (nurse/admin đang login)
    const newOrder = new TestOrderModel({
      user_id,
      created_by: nurseId, // 🔥 dòng này rất quan trọng
      order_code: order_code || `ORD-${Date.now()}`,
      patient_name,
      date_of_birth,
      gender,
      age,
      address,
      phone_number,
      email,
      status: status || 'pending',
      priority: priority || 'normal',
      test_type,
      notes,
      created_at: new Date(),
      updated_at: new Date(),
    });
    

    const savedOrder = await newOrder.save();


    res.status(201).json({
      message: 'Nurse đã ghi nhận test order thành công',
      data: savedOrder,
    });
  } catch (err) {
    console.error('❌ Lỗi khi nurse ghi test order:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
// 👩‍⚕️ NURSE xem danh sách các test order mình đã tạo
exports.getCreatedTestOrders = async (req, res) => {
  try {
    const currentUser = req.user;
    const nurseId = currentUser?.userId;
    const role = currentUser?.role;

    if (!nurseId || (role !== 'nurse' && role !== 'admin')) {
      return res.status(403).json({
        message: 'Access denied. Only nurse or admin can view this data.'
      });
    }

    const test_orders = await TestOrderModel.find({ created_by: nurseId })
      .sort({ created_at: -1 });

    res.status(200).json({
      message: 'Lấy danh sách test orders do nurse tạo thành công',
      data: test_orders,
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy test orders của nurse:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
// 🧩 Nurse hoặc admin cập nhật test order
exports.updateTestOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const nurseId = req.user?.userId;
    const role = req.user?.role;

    // Tìm order cần cập nhật
    const order = await TestOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy test order' });
    }

    // ✅ Nếu là nurse, chỉ được update order mình tạo
    if (role === 'nurse') {
      if (!order.created_by) {
        return res.status(403).json({ message: 'Order này không có thông tin người tạo (không thể cập nhật)' });
      }

      if (order.created_by.toString() !== nurseId) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật test order này' });
      }
    }

    // ✅ Cho phép cập nhật toàn bộ dữ liệu (ngoại trừ _id và created_by)
    const updateFields = { ...req.body, updated_at: Date.now() };
    delete updateFields._id;
    delete updateFields.created_by;

    const updatedOrder = await TestOrderModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    res.status(200).json({
      message: 'Cập nhật test order thành công',
      data: updatedOrder,
    });

  } catch (err) {
    console.error('❌ Lỗi khi cập nhật test order:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};


exports.deleteTestOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const nurseId = req.user?.userId;
    const role = req.user?.role;

    const order = await TestOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy test order' });
    }

    // Nurse chỉ được xóa test order mình tạo
    if (role === 'nurse' && order.created_by.toString() !== nurseId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa test order này' });
    }

    await TestOrderModel.findByIdAndDelete(id);

    res.status(200).json({ message: 'Xóa test order thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi xóa test order:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
exports.updateTestOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (!status) {
      return res.status(400).json({ message: 'Thiếu trạng thái mới (status)' });
    }

    const order = await TestOrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy test order' });
    }

    // Nurse chỉ được update test orders mình tạo
    if (userRole === 'nurse' && order.created_by?.toString() !== userId) {
      return res.status(403).json({
        message: 'Bạn không có quyền cập nhật trạng thái test order này',
      });
    }

    // Doctor có thể update bất kỳ
    if (!['nurse', 'doctor', 'admin'].includes(userRole)) {
      return res.status(403).json({
        message: 'Chỉ doctor, nurse hoặc admin được phép cập nhật trạng thái',
      });
    }

    order.status = status;
    order.updated_at = Date.now();
    await order.save();

    res.status(200).json({
      message: 'Cập nhật trạng thái test order thành công',
      data: order,
    });
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật trạng thái test order:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};



