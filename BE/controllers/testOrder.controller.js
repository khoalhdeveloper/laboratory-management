const TestOrderModel = require('../models/testOrder.model');
const AccountModel = require('../models/account.model');
const { pushNotification } = require('../helpers/notification.helper');

// =========================================================
//  Create Test Order
// =========================================================
exports.getMyTestOrders = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.userid;

    if (!userid) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userAccount = await AccountModel.findOne({ userid: userid });
    const userEmail = userAccount?.email;

    let query;
    if (userEmail) {
      query = {
        $or: [
          { userid: userid },
          { email: { $regex: new RegExp(`^${userEmail}$`, 'i') } } // Case-insensitive
        ]
      };
    } else {
      query = { userid: userid };
    }

    const testOrders = await TestOrderModel.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Get test orders successfully',
      data: testOrders,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Create Test Order for User (by nurse or admin)
// =========================================================
exports.createTestOrderForUser = async (req, res) => {
  try {
    const currentUser = req.user;

    const {
      email,
      order_code,
      status,
      priority,
      test_type,
      notes,
      patient_name,
      phone_number,
      address,
      gender,
      age,
      date_of_birth
    } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Missing required information: email'
      });
    }

    let userid, finalPatientName, finalPhoneNumber, finalAddress, finalGender, finalAge, finalDateOfBirth;


    const userAccount = await AccountModel.findOne({ email: email });
    
    if (userAccount) {

      if (!userAccount.isActive) {
        return res.status(400).json({
          message: 'User account is not activated'
        });
      }
      userid = userAccount.userid;
      finalPatientName = userAccount.fullName;
      finalPhoneNumber = userAccount.phoneNumber;
      finalAddress = userAccount.address;
      finalGender = userAccount.gender;
      finalAge = userAccount.age;
      finalDateOfBirth = userAccount.dateOfBirth;
    } else {

      if (!patient_name) {
        return res.status(400).json({
          message: 'Patient name is required for new users'
        });
      }
      
      // Tìm TEMP userid lớn nhất bằng aggregation (tối ưu khi có nhiều users)
      const result = await AccountModel.aggregate([
        {
          $match: {
            userid: { $regex: /^TEMP-\d+$/ }
          }
        },
        {
          $project: {
            number: {
              $toInt: {
                $substr: ["$userid", 5, -1] // Bỏ qua "TEMP-" (5 ký tự)
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            maxNumber: { $max: "$number" }
          }
        }
      ]);

      let nextNumber = 1;
      if (result.length > 0 && result[0].maxNumber !== null && result[0].maxNumber !== undefined) {
        nextNumber = result[0].maxNumber + 1;
      }
      
      userid = `TEMP-${nextNumber}`;
      finalPatientName = patient_name;
      finalPhoneNumber = phone_number || '';
      finalAddress = address || '';
      finalGender = gender || '';
      finalAge = age || null;
      finalDateOfBirth = date_of_birth || null;
    }


    let finalOrderCode = order_code;
    const isValidOrderCode = finalOrderCode && 
                             typeof finalOrderCode === 'string' &&
                             finalOrderCode.trim() !== '' && 
                             finalOrderCode.toLowerCase() !== 'string' &&
                             finalOrderCode.match(/^ORD-\d+$/);
    
    if (!isValidOrderCode) {

      const result = await TestOrderModel.aggregate([
        {
          $match: {
            order_code: { $regex: /^ORD-\d+$/ }
          }
        },
        {
          $project: {
            number: {
              $toInt: {
                $substr: ["$order_code", 4, -1]
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            maxNumber: { $max: "$number" }
          }
        }
      ]);

      let nextNumber = 1;
      if (result.length > 0 && result[0].maxNumber !== null && result[0].maxNumber !== undefined) {
        nextNumber = result[0].maxNumber + 1;
      }


      finalOrderCode = `ORD-${nextNumber}`;
    } else {

      const existingOrder = await TestOrderModel.findOne({ order_code: finalOrderCode });
      if (existingOrder) {
        return res.status(400).json({
          message: `Order code ${finalOrderCode} already exists. Please use a different order code or leave it blank for auto-generation.`
        });
      }
    }

    const newOrder = new TestOrderModel({
      userid,
      created_by: currentUser?.fullName || currentUser?.username || 'Nurse', 
      order_code: finalOrderCode,
      patient_name: finalPatientName,
      date_of_birth: finalDateOfBirth,
      gender: finalGender,
      age: finalAge,
      address: finalAddress,
      phone_number: finalPhoneNumber,
      email,
      status: status || 'pending',
      priority: priority || 'normal',
      test_type: test_type || 'General Check-up',
      notes: notes || (userAccount ? 'Test order created automatically from user account' : 'Test order created for new user'),
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: 'Test order created successfully',
      data: savedOrder,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
// Get test orders created by the nurse
// =========================================================
exports.getCreatedTestOrders = async (req, res) => {
  try {
    const currentUser = req.user;

    const createdBy = currentUser?.fullName || currentUser?.username || 'nurse';
    
    const test_orders = await TestOrderModel.find({ created_by: createdBy })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Get created test orders successfully',
      data: test_orders,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Update Test Order
// =========================================================
exports.updateTestOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    const currentUserFullName = req.user?.fullName || req.user?.username;

    const order = await TestOrderModel.findOne({ order_code });
    if (!order) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const updateFields = { ...req.body, updated_at: Date.now() };
    delete updateFields._id;
    delete updateFields.created_by;

    const updatedOrder = await TestOrderModel.findOneAndUpdate(
      { order_code },
      updateFields,
      { new: true }
    );

    res.status(200).json({
      message: 'Update test order successfully',
      data: updatedOrder,
    });

  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Delete Test Order (xoa cung)
// =========================================================
exports.deleteTestOrder = async (req, res) => {
  try {
    const { order_code } = req.params;
    const currentUserFullName = req.user?.fullName || req.user?.username;

    const order = await TestOrderModel.findOne({ order_code });
    if (!order) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    await TestOrderModel.findOneAndDelete({ order_code });

    res.status(200).json({ message: 'Delete test order successfully' });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Update test order status
// =========================================================
exports.updateTestOrderStatus = async (req, res) => {
  try {
    const { order_code } = req.params;
    const { status } = req.body;
    const currentUserFullName = req.user?.fullName || req.user?.username;

    if (!status) {
      return res.status(400).json({ message: 'Missing new status (status)' });
    }

    const order = await TestOrderModel.findOne({ order_code });
    if (!order) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    order.status = status;
    order.updated_at = Date.now();
    await order.save();

   
   
    await pushNotification({
      userid: order.userid, 
      title: 'Update Test Order Status',
      message: `Test application ${order.order_code} has been updated to status ${status}.`,
      type: 'info',
      for: 'user'
    });

    res.status(200).json({
      message: 'Update test order status successfully',
      data: order,
    });
  } catch (err) {
    console.error('Error updating test order status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get test orders by userid
// =========================================================
exports.getTestOrdersByUserId = async (req, res) => {
  try {
    const { userid } = req.params;

    const testOrders = await TestOrderModel.find({ userid: userid })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Get test orders by userid successfully',
      data: testOrders,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get all test orders with filters and pagination
// =========================================================
exports.getAllTestOrders = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      test_type, 
      created_by, 
      userid,
      page = 1, 
      limit = 10, 
      sort_by = 'createdAt', 
      sort_order = 'desc' 
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (test_type) query.test_type = test_type;
    if (created_by) query.created_by = created_by;
    if (userid) query.userid = userid;

    const sort = {};
    sort[sort_by] = sort_order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const testOrders = await TestOrderModel.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));


    const total = await TestOrderModel.countDocuments(query);


    const stats = await TestOrderModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total_orders: { $sum: 1 },
          pending_orders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processing_orders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          completed_orders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled_orders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      message: 'Get all test orders successfully',
      data: testOrders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      },
      statistics: stats[0] || {
        total_orders: 0,
        pending_orders: 0,
        processing_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get test order by order_code
// =========================================================
exports.getTestOrderByCode = async (req, res) => {
  try {
    const { order_code } = req.params;

    const order = await TestOrderModel.findOne({ order_code });
    if (!order) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    res.status(200).json({
      message: 'Get test order successfully',
      data: order,
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.updateMyTestOrder = async (req, res) => {
  try {
    const { order_code } = req.params;

    const order = await TestOrderModel.findOne({ order_code });
    if (!order) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const updateFields = { ...req.body, updated_at: new Date() };
    delete updateFields._id;
    delete updateFields.userid; 
    delete updateFields.created_by; 

    const updatedOrder = await TestOrderModel.findOneAndUpdate(
      { order_code },
      updateFields,
      { new: true }
    );

    res.status(200).json({
      message: 'Update test order successfully',
      data: updatedOrder,
    });

  } catch (err) {
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get test orders by userid with filters (status, priority, pagination)
// =========================================================
exports.getTestOrdersByUserIdWithFilters = async (req, res) => {
  try {
    const { userid } = req.params;
    const { status, priority, page = 1, limit = 10 } = req.query;

   
    const query = { userid: userid };
    if (status) query.status = status;
    if (priority) query.priority = priority;

   
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const testOrders = await TestOrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestOrderModel.countDocuments(query);

    res.status(200).json({
      message: 'Get test orders by userid with filters successfully',
      data: testOrders,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        total_items: total,
        items_per_page: parseInt(limit)
      }
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
