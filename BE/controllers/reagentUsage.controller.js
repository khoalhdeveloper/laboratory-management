const Reagent = require('../models/reagent.model');
const ReagentUsage = require('../models/reagentUsage.model');
const Instrument = require('../models/intrusment.model'); 

// =========================================================
//  SỬ DỤNG THUỐC
// =========================================================
exports.useReagents = async (req, res) => {
  try {
    const { reagents, instrument_id, procedure, notes } = req.body; 
    let usedBy = req.user.username;
    if (!usedBy && req.user.userId) {
      const AccountModel = require('../models/account.model');
      const user = await AccountModel.findById(req.user.userId).select('username');
      usedBy = user ? user.username : `User_${req.user.userId.toString().slice(-4)}`;
    }
    
    const userRole = req.user.role;

    const usageRecords = [];

    for (const item of reagents) {
      const reagent = await Reagent.findOne({ reagent_name: item.reagent_name });
      if (!reagent) {
        return res.status(404).json({ message: `Không tìm thấy thuốc: ${item.reagent_name}` });
      }

      if (reagent.quantity_available < item.quantity_used) {
        return res.status(400).json({
          message: `Không đủ số lượng cho thuốc: ${item.reagent_name}`,
          available: reagent.quantity_available,
          requested: item.quantity_used
        });
      }

      reagent.quantity_available -= item.quantity_used;
      await reagent.save();
      const usage = await ReagentUsage.create({
        reagent_name: reagent.reagent_name,
        quantity_used: item.quantity_used,
        used_by: usedBy,
        role: userRole,
        used_at: new Date(),
      });

      usageRecords.push(usage);
    }

    res.status(200).json({
      message: 'Đã cập nhật thành công việc dùng thuốc',
      usageRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// =========================================================
//  SỬ DỤNG THUỐC CHO THIẾT BỊ CỤ THỂ
// =========================================================
exports.useReagentsForInstrument = async (req, res) => {
  try {
    const { instrument_id, reagents, procedure, notes } = req.body;
    
    if (!instrument_id) {
      return res.status(400).json({ message: 'Thiếu mã thiết bị (instrument_id)' });
    }

    if (!reagents || !Array.isArray(reagents) || reagents.length === 0) {
      return res.status(400).json({ message: 'Thiếu thông tin thuốc sử dụng' });
    }

    let usedBy = req.user.username;
    if (!usedBy && req.user.userId) {
      const AccountModel = require('../models/account.model');
      const user = await AccountModel.findById(req.user.userId).select('username');
      usedBy = user ? user.username : `User_${req.user.userId.toString().slice(-4)}`;
    }
    
    const userRole = req.user.role;

    
    const instrument = await Instrument.findOne({ instrument_id: instrument_id });
    if (!instrument) {
      return res.status(404).json({ message: `Không tìm thấy thiết bị: ${instrument_id}` });
    }

    const usageRecords = [];

    for (const item of reagents) {
      const reagent = await Reagent.findOne({ reagent_name: item.reagent_name });
      if (!reagent) {
        return res.status(404).json({ message: `Không tìm thấy thuốc: ${item.reagent_name}` });
      }

      if (reagent.quantity_available < item.quantity_used) {
        return res.status(400).json({
          message: `Không đủ số lượng cho thuốc: ${item.reagent_name}`,
          available: reagent.quantity_available,
          requested: item.quantity_used
        });
      }

      
      reagent.quantity_available -= item.quantity_used;
      await reagent.save();

      // Create usage record with instrument information
      const usage = await ReagentUsage.create({
        reagent_name: reagent.reagent_name,
        quantity_used: item.quantity_used,
        used_by: usedBy,
        role: userRole,
        used_at: new Date(),
        instrument_id: instrument.instrument_id,
        instrument_name: instrument.name,
        procedure: procedure,
        notes: notes
      });

      usageRecords.push(usage);
    }

    res.status(200).json({
      message: 'Đã cập nhật thành công việc dùng thuốc cho thiết bị',
      instrument: {
        instrument_id: instrument.instrument_id,
        name: instrument.name
      },
      procedure: procedure,
      usageRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

  // =========================================================
  //  Xem lịch sử dùng thuốc
  // =========================================================
exports.getReagentUsageHistory = async (req, res) => {
  try {
    const { 
      reagent_name, 
      used_by, 
      role,
      instrument_id,
      instrument_name,
      procedure,
      from_date, 
      to_date, 
      limit = 50, 
      page = 1 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (reagent_name) filter.reagent_name = new RegExp(reagent_name, 'i');
    if (used_by) filter.used_by = new RegExp(used_by, 'i');
    if (role) filter.role = role;
    if (instrument_id) filter.instrument_id = instrument_id;
    if (instrument_name) filter.instrument_name = new RegExp(instrument_name, 'i');
    if (procedure) filter.procedure = new RegExp(procedure, 'i');
    
    // Date range filter
    if (from_date || to_date) {
      filter.used_at = {};
      if (from_date) filter.used_at.$gte = new Date(from_date);
      if (to_date) filter.used_at.$lte = new Date(to_date);
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const usageHistory = await ReagentUsage.find(filter)
      .sort({ used_at: -1 }) // Mới nhất trước
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await ReagentUsage.countDocuments(filter);
    
    // Thống kê tổng quan
    const stats = await ReagentUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalQuantityUsed: { $sum: '$quantity_used' },
          totalRecords: { $sum: 1 },
          uniqueReagents: { $addToSet: '$reagent_name' },
          uniqueUsers: { $addToSet: '$used_by' }
        }
      }
    ]);
    
    res.status(200).json({
      message: 'Lấy lịch sử dùng thuốc thành công',
      data: usageHistory,
      statistics: {
        totalQuantityUsed: stats[0]?.totalQuantityUsed || 0,
        totalRecords: stats[0]?.totalRecords || 0,
        uniqueReagents: stats[0]?.uniqueReagents?.length || 0,
        uniqueUsers: stats[0]?.uniqueUsers?.length || 0
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      filters: {
        reagent_name,
        used_by,
        role,
        from_date,
        to_date
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
