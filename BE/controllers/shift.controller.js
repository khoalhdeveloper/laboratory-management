const Shift = require('../models/shift.model');
const { pushNotification } = require('../helpers/notification.helper');


async function genShiftId() {
  const count = await Shift.countDocuments();
  return `SHF-${String(count + 1).padStart(4, '0')}`;
}

function timeOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

exports.createShift = async (req, res) => {
  try {
    const { title, date, start_time, end_time, department, instrument_id, assigned_users = [], notes } = req.body;

    if (!title || !date || !start_time || !end_time) {
      return res.status(400).json({ message: 'title, date, start_time, end_time are required' });
    }

    const shift_id = await genShiftId();

    const newShift = await Shift.create({
      shift_id,
      title,
      date: new Date(date),
      start_time,
      end_time,
      department,
      instrument_id,
      assigned_users,
      notes,
      created_by: req.user?.userid || req.user?.username,
      status: 'planned'
    });

    if (assigned_users && assigned_users.length > 0) {
      for (const user of assigned_users) {
        await pushNotification({
          userid: user.userid,
          title: 'New Shift Assigned',
          message: `You have been assigned to shift "${title}" on ${new Date(date).toLocaleDateString()} from ${start_time} to ${end_time}`,
          type: 'info',
          for: 'user'
        });
      }

    }

    return res.status(201).json({ message: 'Shift created successfully', data: newShift });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getShifts = async (req, res) => {
  try {
    const { date_from, date_to, userid, instrument_id, status, department, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (date_from || date_to) {
      filter.date = {};
      if (date_from) filter.date.$gte = new Date(date_from);
      if (date_to) filter.date.$lte = new Date(date_to);
    }
    if (instrument_id) filter.instrument_id = instrument_id;
    if (status) filter.status = status;
    if (department) filter.department = new RegExp(department, 'i');
    if (userid) filter['assigned_users.userid'] = userid;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Shift.find(filter).sort({ date: 1, start_time: 1 }).skip(skip).limit(parseInt(limit)),
      Shift.countDocuments(filter)
    ]);

    return res.status(200).json({ message: 'Shifts retrieved', total, data });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMyShifts = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.username;
    if (!userid) return res.status(401).json({ message: 'Unauthorized' });

    const { date_from, date_to, status, department, page = 1, limit = 20 } = req.query;

    const filter = { 'assigned_users.userid': userid };
    if (date_from || date_to) {
      filter.date = {};
      if (date_from) filter.date.$gte = new Date(date_from);
      if (date_to) filter.date.$lte = new Date(date_to);
    }
    if (status) filter.status = status;
    if (department) filter.department = new RegExp(department, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Shift.find(filter).sort({ date: 1, start_time: 1 }).skip(skip).limit(parseInt(limit)),
      Shift.countDocuments(filter)
    ]);

    return res.status(200).json({ message: 'My shifts retrieved', total, data });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const { shift_id } = req.params;
    const updateData = { ...req.body, updated_by: req.user?.userid || req.user?.username };

    const shift = await Shift.findOne({ shift_id });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    const updated = await Shift.findOneAndUpdate({ shift_id }, updateData, { new: true });

    if (assigned_users && assigned_users.length > 0) {
      for (const user of assigned_users) {
        await pushNotification({
          userid: user.userid,
          title: 'Shift Updated',
          message: `Shift "${updated.title}" has been updated. Please check the new details.`,
          type: 'info',
          for: 'user'
        });
      }

    }

    return res.status(200).json({ message: 'Shift updated', data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.publishShift = async (req, res) => {
  try {
    const { shift_id } = req.params;
    const shift = await Shift.findOne({ shift_id });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    shift.status = 'published';
    shift.updated_by = req.user?.userid || req.user?.username;
    await shift.save();

    if (shift.assigned_users && shift.assigned_users.length > 0) {
      for (const user of shift.assigned_users) {
        const uid = user.userid || user;
        await pushNotification({
          userid: uid,
          title: 'Shift Published',
          message: `Shift "${shift.title}" has been published. Date: ${new Date(shift.date).toLocaleDateString()} from ${shift.start_time} to ${shift.end_time}`,
          type: 'success',
          for: 'user'
        });
      }
    }



    return res.status(200).json({ message: 'Shift published', data: shift });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.assignUsers = async (req, res) => {
  try {
    const { shift_id } = req.params;
    const { assigned_users = [] } = req.body;

    const shift = await Shift.findOne({ shift_id });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    shift.assigned_users = assigned_users;
    shift.updated_by = req.user?.userid || req.user?.username;
    await shift.save();

    if (assigned_users && assigned_users.length > 0) {
      for (const user of assigned_users) {
        await pushNotification({
          userid: user.userid,
          title: 'Shift Assignment',
          message: `You have been assigned to shift "${shift.title}" on ${new Date(shift.date).toLocaleDateString()} from ${shift.start_time} to ${shift.end_time}`,
          type: 'success',
          for: 'user'
        });
      }
    }

    return res.status(200).json({ message: 'Assigned users updated', data: shift });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.cancelShift = async (req, res) => {
  try {
    const { shift_id } = req.params;
    const shift = await Shift.findOne({ shift_id });
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    shift.status = 'cancelled';
    shift.updated_by = req.user?.userid || req.user?.username;
    await shift.save();

    if (shift.assigned_users && shift.assigned_users.length > 0) {
      for (const user of shift.assigned_users) {
        const uid = user.userid || user;
        await pushNotification({
          userid: uid,
          title: 'Shift Cancelled',
          message: `Shift "${shift.title}" scheduled for ${new Date(shift.date).toLocaleDateString()} from ${shift.start_time} to ${shift.end_time} has been cancelled.`,
          type: 'warning',
          for: 'user'
        });
      }
    }

    return res.status(200).json({ message: 'Shift cancelled', data: shift });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
