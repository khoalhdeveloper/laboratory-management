const Reagent = require('../models/reagent.model');
const ReagentUsage = require('../models/reagentUsage.model');
const Instrument = require('../models/intrusment.model');

// =========================================================
//  Use Reagents (General)
// =========================================================
exports.useReagents = async (req, res) => {
  try {
    const { reagents, instrument_id, procedure, notes, used_for } = req.body;
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
        return res.status(404).json({ message: `Reagent not found: ${item.reagent_name}` });
      }

      if (reagent.quantity_available < item.quantity_used) {
        return res.status(400).json({
          message: `Insufficient quantity for reagent: ${item.reagent_name}`,
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
        notes,
        used_for, 
      });

      usageRecords.push(usage);
    }

    res.status(200).json({
      message: 'Reagent usage updated successfully',
      usageRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =========================================================
//  Use Reagents for Specific Instrument
// =========================================================
exports.useReagentsForInstrument = async (req, res) => {
  try {
    const { instrument_id, reagents, procedure, notes, used_for } = req.body;

    if (!instrument_id) {
      return res.status(400).json({ message: 'Missing instrument ID (instrument_id)' });
    }

    if (!reagents || !Array.isArray(reagents) || reagents.length === 0) {
      return res.status(400).json({ message: 'Missing reagent usage information' });
    }

    let usedBy = req.user.username;
    if (!usedBy && req.user.userId) {
      const AccountModel = require('../models/account.model');
      const user = await AccountModel.findById(req.user.userId).select('username');
      usedBy = user ? user.username : `User_${req.user.userId.toString().slice(-4)}`;
    }

    const userRole = req.user.role;
    const instrument = await Instrument.findOne({ instrument_id });
    if (!instrument) {
      return res.status(404).json({ message: `Instrument not found: ${instrument_id}` });
    }

    const usageRecords = [];

    for (const item of reagents) {
      const reagent = await Reagent.findOne({ reagent_name: item.reagent_name });
      if (!reagent) {
        return res.status(404).json({ message: `Reagent not found: ${item.reagent_name}` });
      }

      if (reagent.quantity_available < item.quantity_used) {
        return res.status(400).json({
          message: `Insufficient quantity for reagent: ${item.reagent_name}`,
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
        instrument_id: instrument.instrument_id,
        instrument_name: instrument.name,
        procedure,
        notes,
        used_for,
      });

      usageRecords.push(usage);
    }

    res.status(200).json({
      message: 'Reagent usage updated successfully',
      instrument: {
        instrument_id: instrument.instrument_id,
        name: instrument.name
      },
      procedure,
      usageRecords,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =========================================================
//  Get Reagent Usage History (Filter Multiple Fields)
// =========================================================
exports.getReagentUsageHistory = async (req, res) => {
  try {
    const {
      reagent_name, used_by, role, instrument_id, instrument_name,
      procedure, used_for, from_date, to_date, limit = 50, page = 1
    } = req.query;

    const filter = {};
    if (reagent_name) filter.reagent_name = new RegExp(reagent_name, 'i');
    if (used_by) filter.used_by = new RegExp(used_by, 'i');
    if (role) filter.role = role;
    if (instrument_id) filter.instrument_id = instrument_id;
    if (instrument_name) filter.instrument_name = new RegExp(instrument_name, 'i');
    if (procedure) filter.procedure = new RegExp(procedure, 'i');
    if (used_for) filter.used_for = new RegExp(used_for, 'i');

    if (from_date || to_date) {
      filter.used_at = {};
      if (from_date) filter.used_at.$gte = new Date(from_date);
      if (to_date) filter.used_at.$lte = new Date(to_date);
    }

    const skip = (page - 1) * limit;

    const usageHistory = await ReagentUsage.find(filter)
      .sort({ used_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ReagentUsage.countDocuments(filter);

    res.status(200).json({
      message: 'Reagent usage history retrieved successfully',
      total,
      data: usageHistory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =========================================================
//  Get Reagent Usage History by Used For
// =========================================================
exports.getReagentUsageByUsedFor = async (req, res) => {
  try {
    const { used_for } = req.params;

    if (!used_for) {
      return res.status(400).json({ message: 'Missing used_for information' });
    }

    const records = await ReagentUsage.find({ used_for: new RegExp(used_for, 'i') })
      .sort({ used_at: -1 });

    if (!records.length) {
      return res.status(404).json({ message: `No history found for used_for: ${used_for}` });
    }

    res.status(200).json({
      message: `Reagent usage history for purpose: ${used_for}`,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =========================================================
//  Get Reagent Usage History by Instrument ID
// =========================================================
exports.getReagentUsageByInstrument = async (req, res) => {
  try {
    const { instrument_id } = req.params;

    if (!instrument_id) {
      return res.status(400).json({ message: 'Missing instrument_id' });
    }

    const records = await ReagentUsage.find({ instrument_id }).sort({ used_at: -1 });

    if (!records.length) {
      return res.status(404).json({ message: `No history found for instrument: ${instrument_id}` });
    }

    const stats = await ReagentUsage.aggregate([
      { $match: { instrument_id } },
      {
        $group: {
          _id: "$instrument_id",
          instrument_name: { $first: "$instrument_name" },
          totalQuantityUsed: { $sum: "$quantity_used" },
          totalRecords: { $sum: 1 },
          uniqueReagents: { $addToSet: "$reagent_name" },
          uniqueUsers: { $addToSet: "$used_by" }
        }
      }
    ]);

    res.status(200).json({
      message: `Reagent usage history for instrument: ${instrument_id}`,
      instrument_id,
      stats: stats[0] || {},
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
