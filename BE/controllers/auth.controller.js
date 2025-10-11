const AccountModel = require('../models/account.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailSender = require('../helpers/email.sender');
const getHTMLRegisterComfirm = require('../public/register_comfirm');
const getHTMLForgotPassword = require('../public/forgot_password');

module.exports = {
  // =========================================================
  // register
  // =========================================================
  register: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        phoneNumber,
        fullName,
        identifyNumber,
        age,
        address,
        dateOfBirth,
        role
      } = req.body;

      // check username trùng
      const existingUser = await AccountModel.findOne({ username });
      if (existingUser)
        return res.status(409).json({ message: 'Username already exists' });

      // check email trùng
      const existingEmail = await AccountModel.findOne({ email });
      if (existingEmail)
        return res.status(409).json({ message: 'Email already exists' });

      //  Mã hoá mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Tự động tạo userid: theo dạng User1, User2, ...
      const lastAccount = await AccountModel.findOne().sort({ createdAt: -1 }).exec();
      let newUserId = 'User1';
      if (lastAccount?.userid) {
        const lastNumber = parseInt(lastAccount.userid.replace('User', '')) || 0;
        newUserId = `User${lastNumber + 1}`;
      }

      //  Tạo tài khoản mới
      const newAccount = await AccountModel.create({
        userid: newUserId,
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        fullName,
        identifyNumber,
        age,
        address,
        dateOfBirth,
        role,
        isActive: false
      });

      // Gửi mail xác thực
      const token = jwt.sign({ userId: newAccount._id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });
      const verifyLink = `http://localhost:5000/api/auth/verify/${token}`;

      await emailSender({
        email: newAccount.email,
        subject: 'Welcome to Our Service',
        html: getHTMLRegisterComfirm({ name: newAccount.username, link: verifyLink })
      });

      return res.status(201).json({
        message: 'Account registered successfully. Please check your email to activate.',
        account: newAccount
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // =========================================================
  // XÁC THỰC TÀI KHOẢN (qua email dạng link)
  // =========================================================
  verifyAccount: async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const account = await AccountModel.findById(decoded.userId);
      if (!account)
        return res.redirect('http://localhost:5173/login?error=account_not_found');

      account.isActive = true;
      await account.save();

      return res.redirect('http://localhost:5173/login?verified=success');
    } catch (error) {
      console.error(error);
      return res.redirect('http://localhost:5173/login?error=invalid_token');
    }
  },

  // =========================================================
  //  ĐĂNG NHẬP
  // =========================================================
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const account = await AccountModel.findOne({ username });

      if (!account)
        return res.status(401).json({ message: 'Invalid credentials' });

      //  Kiểm tra trạng thái kích hoạt
      if (!account.isActive) {
        return res.status(403).json({
          message: 'Account is not active. Please check your email or contact support.'
        });
      }

      //  Kiểm tra 90 ngày không hoạt động
      if (account.lastLogin) {
        const lastLoginDate = new Date(account.lastLogin);
        const daysInactive = Math.floor((Date.now() - lastLoginDate) / (1000 * 60 * 60 * 24));

        if (daysInactive > 90) {
          account.isActive = false;
          await account.save();
          return res.status(403).json({
            message: 'Account has been locked due to 90 days of inactivity.'
          });
        }
      }

      //  Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        account.failedLoginAttempts = (account.failedLoginAttempts || 0) + 1;

        //  Nếu sai >= 5 lần → khóa tài khoản
        if (account.failedLoginAttempts >= 5) {
          account.isActive = false;
          await account.save();
          return res.status(423).json({
            message: 'Account has been locked due to too many failed login attempts. Please contact support.'
          });
        }

        await account.save();
        const remaining = 5 - account.failedLoginAttempts;
        return res.status(401).json({
          message: `Invalid credentials. ${remaining} attempts remaining before account lock.`
        });
      }

      //  Đăng nhập thành công → reset lỗi và cập nhật lastLogin
      account.failedLoginAttempts = 0;
      account.lastLogin = new Date();
      await account.save();

      //  Tạo JWT Token
      const token = jwt.sign(
        { 
          userId: account._id, 
          role: account.role, 
          username: account.username 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      return res.json({
        message: 'Login successful',
        token,
        role: account.role
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // =========================================================
  //  QUÊN MẬT KHẨU
  // =========================================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const account = await AccountModel.findOne({ email });
      if (!account)
        return res.status(400).json({ message: 'Email không tồn tại' });

      const token = jwt.sign({ userId: account._id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
      });
      const link = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      await emailSender({
        email,
        subject: 'Đặt lại mật khẩu',
        html: getHTMLForgotPassword({ name: account.username, link })
      });

      return res.json({ message: 'Đã gửi mail đặt lại mật khẩu' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // =========================================================
  //  ĐẶT LẠI MẬT KHẨU
  // =========================================================
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6)
        return res.status(400).json({ message: 'Mật khẩu mới không hợp lệ' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const account = await AccountModel.findById(decoded.userId);
      if (!account)
        return res.status(400).json({ message: 'Token không hợp lệ' });

      account.password = await bcrypt.hash(newPassword, 10);
      await account.save();

      return res.json({ message: 'Đặt lại mật khẩu thành công' });

    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }
  }
};
