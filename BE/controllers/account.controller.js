const AccountModel = require('../models/account.model');
const bcrypt = require('bcrypt');
const typerole = require('../constants/typerole');
const { verify } = require('jsonwebtoken');
  // =========================================================
  //  Get all accounts
  // =========================================================
module.exports = {
    getAllAccounts: async (req, res) => {
     
            const accounts = await AccountModel.find();
            res.status(200).json(accounts);
    },
    
  // =========================================================
  //  Delete accounnt (xoa mem)
  // =========================================================
    deleteAccount: async (req, res) => {

    try {
    const { userid, isActive } = req.body;     
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive phải là boolean' });
    }

    const account = await AccountModel.findOneAndUpdate(
      { userid },
      { isActive },
      { new: true } 
    );

    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
    },
  // =========================================================
  //  Update account
  // =========================================================
    updateAccount: async (req, res) => {
        try {
    const { userid } = req.params; 
    const {
      username,
      image,
      email,
      phoneNumber,
      fullName,
      identifyNumber,
      age,
      gender,
      address,
      dateOfBirth,
      role,
      isActive
    } = req.body;

    
    const updateData = {
      username,
      image,
      email,
      phoneNumber,
      fullName,
      identifyNumber,
      age,
      gender,
      address,
      dateOfBirth,
      role,
      isActive
    };

  
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const updatedAccount = await AccountModel.findOneAndUpdate(
      { userid },          // tìm theo userid
      updateData,          
      { new: true }        
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    res.status(200).json(updatedAccount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
    },
    verifyAccount: async (req, res) => {
        try {
    const { userid } = req.params; // lấy userid từ URL

    const account = await AccountModel.findOneAndUpdate(
      { userid },
      { isActive: true },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

   
    res.status(200).json({ message: 'Tài khoản đã được kích hoạt', account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
    },
  // =========================================================
  //  get my account
  // =========================================================
    getMyAccount: async (req, res) => {
      try{
        const userid = req.user?.userId;
    
        if(!userid){
          return res.status(400).json({ message: 'Không tìm thấy userId trong token' });
        }
        
        const account = await AccountModel.findById(userid);
        if(!account){
          return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
        }
        res.status(200).json(account);
      }catch(err){
        res.status(500).json({ message: err.message });
      }
    },
  // =========================================================
  // Change password
  // =========================================================
    changePassword: async (req, res) => {
  try {
    const { userid } = req.params; // lấy userid từ URL
    const { oldPassword, newPassword } = req.body;

    
    const account = await AccountModel.findOne({ userid });
    if (!account) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    
    const isMatch = await bcrypt.compare(oldPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},
  // =========================================================
  // Update my account
  // =========================================================
updateMyAccount: async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = currentUser?.userId; 
    const isAdmin = currentUser?.role === 'admin';

    if (!userId) {
      return res.status(400).json({ message: 'Không tìm thấy userId trong token' });
    }

    const {
      username,
      image,
      email,
      phoneNumber,
      fullName,
      identifyNumber,
      age,
      gender,
      address,
      dateOfBirth,
    } = req.body;

    const updateData = {
      username,
      image,
      email,
      phoneNumber,
      fullName,
      identifyNumber,
      age,
      gender,
      address,
      dateOfBirth,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    if (!isAdmin) {
      delete updateData.role;
      delete updateData.isActive;
    }

    
    const updatedAccount = await AccountModel.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    res.status(200).json({
      message: 'Cập nhật tài khoản thành công',
      account: updatedAccount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

}