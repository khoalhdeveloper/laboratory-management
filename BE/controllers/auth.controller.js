const AccountModel = require('../models/account.model');
const TestOrderModel = require('../models/testOrder.model');
const TestResultModel = require('../models/testResult.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailSender = require('../helpers/email.sender');
const getHTMLRegisterComfirm = require('../public/register_comfirm');
const getHTMLForgotPassword = require('../public/forgot_password');
const SettingModel = require('../models/setting.model');
const { getVNTime } = require('../helpers/time.helper');

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

      
      const existingUser = await AccountModel.findOne({ username });
      if (existingUser)
        return res.status(409).json({ message: 'Username already exists' });

      
      const existingEmail = await AccountModel.findOne({ email });
      if (existingEmail)
        return res.status(409).json({ message: 'Email already exists' });

      
      const hashedPassword = await bcrypt.hash(password, 10);

      
      const lastAccount = await AccountModel.findOne().sort({ createdAt: -1 }).exec();
      let newUserId = 'User1';
      if (lastAccount?.userid) {
        const lastNumber = parseInt(lastAccount.userid.replace('User', '')) || 0;
        newUserId = `User${lastNumber + 1}`;
      }

      
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

      

      try {

        const testOrders = await TestOrderModel.find({ 
          email: { $regex: new RegExp(`^${newAccount.email}$`, 'i') } 
        });
        
        if (testOrders.length > 0) {
          const updateResult = await TestOrderModel.updateMany(
            { email: { $regex: new RegExp(`^${newAccount.email}$`, 'i') } },
            { $set: { userid: newUserId } }
          );
          
          const orderCodes = testOrders.map(order => order.order_code);
        }
      } catch (updateError) {
      }
      
      const token = jwt.sign({ userId: newAccount._id }, process.env.JWT_SECRET, {
        expiresIn: '5m'
      });
      const verifyLink = `https://deloy-project.vercel.app/api/auth/verify/${token}`;

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
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // =========================================================
  // Verify account (link verify)
  // =========================================================
  verifyAccount: async (req, res) => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const account = await AccountModel.findById(decoded.userId);
      if (!account)
        return res.redirect('https://laboratory-management-phi.vercel.app/login?error=account_not_found');

      account.isActive = true;
      await account.save();

      return res.redirect('https://laboratory-management-phi.vercel.app/login?verified=success');
    } catch (error) {
      console.error(error);
      return res.redirect('https://laboratory-management-phi.vercel.app/login?error=invalid_token');
    }
  },

  // =========================================================
  //  Login
  // =========================================================
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const account = await AccountModel.findOne({ username });

      if (!account)
        return res.status(401).json({ message: 'Invalid credentials' });

     
      const settings = await SettingModel.findOne({});
      const maxFailedAttempts = settings?.maxFailedLoginAttempts || 5;
      const inactivityLockDays = settings?.inactivityLockDays || 90;
      const jwtExpirationHours = settings?.jwtExpirationHours || 8;
      
      
      if (!account.isActive) {
        return res.status(403).json({
          message: 'Account is not active. Please check your email or contact support.'
        });
      }

      
      if (account.lastLogin) {
        const lastLoginDate = new Date(account.lastLogin);
        const daysInactive = Math.floor((getVNTime() - lastLoginDate) / (1000 * 60 * 60 * 24));

       
        if (daysInactive > inactivityLockDays) {
          account.isActive = false;
          await account.save();
          return res.status(403).json({
            message: `Account has been locked due to ${inactivityLockDays} days of inactivity.`
          });
        }
      }

      
      const isMatch = await bcrypt.compare(password, account.password);
      if (!isMatch) {
        account.failedLoginAttempts = (account.failedLoginAttempts || 0) + 1;

        
        if (account.failedLoginAttempts >= maxFailedAttempts) {
          account.isActive = false;
          await account.save();
          return res.status(423).json({
            message: 'Account has been locked due to too many failed login attempts. Please contact support.'
          });
        }

        await account.save();
        const remaining = maxFailedAttempts - account.failedLoginAttempts;
        return res.status(401).json({
          message: `Invalid credentials. ${remaining} attempts remaining before account lock.`
        });
      }

      
      account.failedLoginAttempts = 0;
      account.lastLogin = getVNTime();
      account.lastActivity = getVNTime();
      await account.save();

      
      
      const token = jwt.sign(
        { 
          userId: account._id, 
          userid: account.userid,
          role: account.role, 
          username: account.username,
          fullName: account.fullName  
        },
        process.env.JWT_SECRET,
        { expiresIn: `${jwtExpirationHours}h` }
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
  //  Forgot password
  // =========================================================
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const account = await AccountModel.findOne({ email });
      if (!account)
        return res.status(400).json({ message: 'Email not found' });

      const token = jwt.sign({ userId: account._id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
      });
      const link = `https://laboratory-management-phi.vercel.app/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      await emailSender({
        email,
        subject: 'Reset Password',
        html: getHTMLForgotPassword({ name: account.username, link })
      });

      return res.json({ message: 'Reset password email sent' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // =========================================================
  //  Reset password
  // =========================================================
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6)
        return res.status(400).json({ message: 'Invalid new password' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const account = await AccountModel.findById(decoded.userId);
      if (!account)
        return res.status(400).json({ message: 'Invalid token' });

      account.password = await bcrypt.hash(newPassword, 10);
      await account.save();

      return res.json({ message: 'Reset password successfully' });

    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Invalid token or expired' });
    }
  },

  // =========================================================
  // Google Login
  // =========================================================
  googleLogin: async (req, res) => {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
      }

      
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      const { email, name, sub: googleId, picture } = payload;

     
      let user = await AccountModel.findOne({ email });

      if (!user) {
     
        const lastAccount = await AccountModel.findOne().sort({ createdAt: -1 }).exec();
        let newUserId = 'User1';
        if (lastAccount?.userid) {
          const lastNumber = parseInt(lastAccount.userid.replace('User', '')) || 0;
          newUserId = `User${lastNumber + 1}`;
        }

        user = new AccountModel({
          userid: newUserId,
          username: email.split('@')[0], 
          email,
          fullName: name,
          avatar: picture,
          googleId,
          isActive: true, 
          role: 'user',
          password: await bcrypt.hash(Math.random().toString(36), 10), 
          createdAt: getVNTime(),
          lastActivity: getVNTime(),
        });

        await user.save();
      } else if (!user.googleId) {
        
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
        await user.save();
      }

      
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is not activated' });
      }

      
      user.lastActivity = getVNTime();
      await user.save();

      
      const token = jwt.sign(
        { 
          userid: user.userid, 
          role: user.role,
          username: user.username,
          fullName: user.fullName  // ✅ Thêm fullName vào Google login token
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Google login successful',
        token,
        role: user.role,
        user: {
          id: user._id,
          userid: user.userid,
          userName: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
        },
      });

    } catch (error) {
      console.error('[Google Login Error]:', error);
      return res.status(500).json({ 
        message: 'Google login failed', 
        error: error.message 
      });
    }
  }
};
