const crypto = require("crypto");

// Thông tin ZegoCloud (lấy từ ZegoCloud dashboard)
const ZEGOCLOUD_APP_ID = parseInt(process.env.ZEGOCLOUD_APP_ID || "0");
const ZEGOCLOUD_SERVER_SECRET = process.env.ZEGOCLOUD_SERVER_SECRET || "";

/**
 * Generate ZegoCloud token theo chuẩn official
 * @param {string} roomId - roomId (consultationId)
 * @param {string} userId - userId của user
 * @param {number} expireTime - token hết hạn (giây, mặc định 2 giờ)
 * @returns {object} { token, appId, roomId, userId }
 */
function generateZegoToken(roomId, userId, expireTime = 7200) {
  if (!ZEGOCLOUD_APP_ID || !ZEGOCLOUD_SERVER_SECRET) {
    throw new Error("Missing ZEGOCLOUD_APP_ID or ZEGOCLOUD_SERVER_SECRET in .env");
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const expireAt = currentTime + expireTime;

  // Payload theo format ZegoCloud
  const payload = {
    ver: 1,
    room_id: roomId,
    user_id: userId,
    privilege: {
      1: 1, // LoginRoom
      2: 1  // PublishStream
    },
    stream_id_list: null,
    expire_time: expireAt
  };

  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64');

  // Generate signature: HMAC-SHA256(payload, serverSecret)
  const signature = crypto
    .createHmac('sha256', ZEGOCLOUD_SERVER_SECRET)
    .update(payloadBase64)
    .digest();

  // Token format: "04" + base64(signature length) + signature + payloadBase64
  const signatureBase64 = signature.toString('base64');
  const signatureLen = signatureBase64.length.toString(16).padStart(4, '0');
  
  const token = `04${signatureLen}${signatureBase64}${payloadBase64}`;

  console.log(`[ZegoCloud] ✅ Token generated for user: ${userId}, room: ${roomId}, expires: ${new Date(expireAt * 1000).toISOString()}`);

  return {
    token,
    appId: ZEGOCLOUD_APP_ID,
    roomId,
    userId
  };
}

module.exports = { generateZegoToken };

