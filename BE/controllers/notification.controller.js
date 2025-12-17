
const Notification = require('../models/notification.model');
const { getVNTime } = require('../helpers/time.helper');

exports.getUserNotifications = async (req, res) => {
  try {
    const { id } = req.params; 
    if (!id) return res.status(400).json({ message: 'User ID is required' });

    const notifications = await Notification.find({ userid: id }).sort({ createdAt: -1 });

    res.json({
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markOneAsReadByMessageId = async (req, res) => {
  try {
    const { message_id } = req.params;
    if (!message_id) return res.status(400).json({ message: 'Message ID is required' });

    const notification = await Notification.findOneAndUpdate(
      { message_id: message_id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ 
      message: 'Notification marked as read', 
      data: notification 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getWarehouseNotifications = async (req, res) => {
  try {
    const userid = req.user?.userid || req.user?.userId;
    
    if (!userid) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notifications = await Notification.find({ 
      $or: [
        { userid: userid },
        { userid: 'Warehouse' }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
