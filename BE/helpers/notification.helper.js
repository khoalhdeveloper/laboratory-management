
const Notification = require('../models/notification.model');
const { getVNTime } = require('./time.helper');


const generateMessageId = async () => {
  const lastNotification = await Notification.findOne().sort({ createdAt: -1 });
  
  let counter = 1;
  if (lastNotification && lastNotification.message_id) {
    const match = lastNotification.message_id.match(/MSG_(\d+)/);
    if (match) {
      counter = parseInt(match[1]) + 1;
    }
  }
  
  let messageId;
  let attempts = 0;
  
  do {
    messageId = `MSG_${counter.toString().padStart(3, '0')}`;
    const existing = await Notification.findOne({ message_id: messageId });
    
    if (!existing) break;
    
    counter++;
    attempts++;
  } while (attempts < 100);
  
  if (attempts >= 100) {
    throw new Error('Unable to generate unique message ID');
  }
  
  return messageId;
};

exports.pushNotification = async ({ userid, title, message, type = 'info', for: forType = 'user' }) => {
  try {
    const users = Array.isArray(userid) ? userid : [userid];

    const notifications = [];
    for (const uid of users) {
      notifications.push({
        message_id: await generateMessageId(),
        userid: uid,
        title,
        message,
        type,
        isRead: false,
        for: forType,
        createdAt: getVNTime(),
      });
    }

    await Notification.insertMany(notifications);

  } catch (err) {
  
  }
};
