const AccountModel = require('../models/account.model');
const AccountHistory = require('../models/accountHistory.model');
const bcrypt = require('bcrypt');
const typerole = require('../constants/typerole');

module.exports = {
  // =========================================================
  // Get all accounts
  // =========================================================
  getAllAccounts: async (req, res) => {
    try {
      const accounts = await AccountModel.find();
      res.status(200).json(accounts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Delete account (lock)
  // =========================================================
  deleteAccount: async (req, res) => {
    try {
      const { userid, isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive is boolean' });
      }

      const account = await AccountModel.findOneAndUpdate(
        { userid },
        { isActive },
        { new: true }
      );

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      res.status(200).json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Update account (admin edit user)
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
        isActive,
      } = req.body;

      // Validate image size if provided (limit to 5MB base64 ~ 6.7MB original)
      if (image && typeof image === 'string') {
        const imageSizeInMB = Buffer.byteLength(image, 'utf8') / (1024 * 1024);
        if (imageSizeInMB > 7) {
          return res.status(400).json({ 
            message: 'Image size too large. Maximum size is 5MB.' 
          });
        }
      }

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
        isActive,
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key]
      );

      const oldAccount = await AccountModel.findOne({ userid });
      if (!oldAccount) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const updatedAccount = await AccountModel.findOneAndUpdate(
        { userid },
        updateData,
        { new: true }
      );

      if (!updatedAccount) {
        return res.status(500).json({ message: 'Failed to update account' });
      }

      // Handle field changes for history (skip image field if too large)
      const fieldChanges = Object.keys(updateData)
        .filter(
          (key) =>
            oldAccount[key]?.toString() !== updatedAccount[key]?.toString()
        )
        .map((key) => {
          const oldVal = oldAccount[key];
          const newVal = updatedAccount[key];
          
          // For image field, truncate if too long for history
          if (key === 'image') {
            return {
              field: key,
              oldValue: oldVal ? (oldVal.length > 100 ? oldVal.substring(0, 100) + '...' : oldVal) : '',
              newValue: newVal ? (newVal.length > 100 ? newVal.substring(0, 100) + '...' : newVal) : '',
            };
          }
          
          return {
            field: key,
            oldValue: oldVal?.toString() || '',
            newValue: newVal?.toString() || '',
          };
        });

      // Save history asynchronously, don't block response if it fails
      if (fieldChanges.length > 0) {
        try {
          await AccountHistory.create({
            userid,
            action: 'update-by-admin',
            fieldChanges,
            performedBy: req.user?.userId || 'unknown',
          });
        } catch (historyError) {
          console.error('Error saving account history:', historyError);
          // Don't fail the request if history fails
        }
      }

      res.status(200).json(updatedAccount);
    } catch (err) {
      console.error('Error updating account:', err);
      res.status(500).json({ 
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  },

  // =========================================================
  // Verify account
  // =========================================================
  verifyAccount: async (req, res) => {
    try {
      const { userid } = req.params;

      const account = await AccountModel.findOneAndUpdate(
        { userid },
        { isActive: true },
        { new: true }
      );

      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      res.status(200).json({ message: 'Account activated successfully', account });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Get my account
  // =========================================================
  getMyAccount: async (req, res) => {
    try {
      const userid = req.user?.userid;

      if (!userid) {
        return res.status(400).json({ message: 'User ID not found in token' });
      }

      const account = await AccountModel.findOne({ userid });
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      res.status(200).json(account);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Change password
  // =========================================================
  changePassword: async (req, res) => {
    try {
      const { userid } = req.params;
      const { oldPassword, newPassword } = req.body;

      const account = await AccountModel.findOne({ userid });
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      const isMatch = await bcrypt.compare(oldPassword, account.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      account.password = hashedPassword;
      await account.save();

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Update my account (user edit self)
  // =========================================================
 updateMyAccount: async (req, res) => {
  try {
    const currentUser = req.user;
    const userid = currentUser?.userid;

    if (!userid) {
      return res.status(400).json({ message: 'User ID not found in token' });
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

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

   
    const oldAccount = await AccountModel.findOne({ userid });
    if (!oldAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    
    const updatedAccount = await AccountModel.findOneAndUpdate(
      { userid },
      updateData,
      { new: true }
    );

    
    const fieldChanges = Object.keys(updateData)
      .filter((key) => {
        const oldVal = oldAccount[key];
        const newVal = updatedAccount[key];

       
        if (oldVal instanceof Date && newVal instanceof Date) {
          return oldVal.getTime() !== newVal.getTime();
        }
        return oldVal?.toString() !== newVal?.toString();
      })
      .map((key) => {
        const oldVal = oldAccount[key];
        const newVal = updatedAccount[key];

        
        if (oldVal === null || oldVal === undefined || oldVal === '') {
          return {
            field: key,
            newValue: newVal ?? '',
          };
        }

       
        return {
          field: key,
          oldValue: oldVal ?? '',
          newValue: newVal ?? '',
        };
      });

    
    if (fieldChanges.length > 0) {
      try {
        await AccountHistory.create({
          userid,
          action: 'update-self',
          fieldChanges,
          performedBy: userid,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Error saving account history:', err);
      }
    }

    res.status(200).json({
      message: 'Account updated successfully',
      account: updatedAccount,
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: err.message });
  }
},

  // =========================================================
  // Get account history update
  // =========================================================
getAccountHistory: async (req, res) => {
  try {
    const { userid } = req.params;

    if (!userid) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    const history = await AccountHistory.find({ userid })
      .sort({ createdAt: -1 }); 

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},

  // =========================================================
  // Get account by email
  // =========================================================
  getAccountByEmail: async (req, res) => {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const account = await AccountModel.findOne({ email });
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }

      // Remove password from response for security
      const { password, ...accountWithoutPassword } = account.toObject();
      res.status(200).json(accountWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },  
  // =========================================================
  // Get all account nurse
  // =========================================================
   getAllAccountNurse: async (req, res) => {
    try {
      const accounts = await AccountModel.find({ role: typerole.nurse });
      res.status(200).json(accounts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // =========================================================
  // Get all nurses and doctors (for group call invites)
  // =========================================================
  getAllNursesAndDoctors: async (req, res) => {
    try {
      const accounts = await AccountModel.find({ 
        role: { $in: ['nurse', 'doctor'] },
        isActive: true 
      }).select('userid username fullName role email');
      res.status(200).json({ accounts });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

};
       