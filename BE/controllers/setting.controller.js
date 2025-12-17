const SettingModel = require('../models/setting.model');

// =========================================================
// Get System Settings
// =========================================================
exports.getSettings = async (req, res) => {
    try {
      
        const settings = await SettingModel.findOne({});
        
        if (!settings) {
          
            await SettingModel.initSettings();
            const newSettings = await SettingModel.findOne({});
            return res.status(200).json({ settings: newSettings });
        }

        return res.status(200).json({ settings });
    } catch (error) {
        console.error('Error getting settings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// =========================================================
// Update System Settings
// =========================================================
exports.updateSettings = async (req, res) => {
    try {
        const {
            sessionTimeoutMinutes,
            jwtExpirationHours,
            maxFailedLoginAttempts,
            inactivityLockDays
        } = req.body;

        const updateData = {};
        if (sessionTimeoutMinutes !== undefined && sessionTimeoutMinutes > 0) {
            updateData.sessionTimeoutMinutes = sessionTimeoutMinutes;
        }
        if (jwtExpirationHours !== undefined && jwtExpirationHours > 0) {
            updateData.jwtExpirationHours = jwtExpirationHours;
        }
        if (maxFailedLoginAttempts !== undefined && maxFailedLoginAttempts > 0) {
            updateData.maxFailedLoginAttempts = maxFailedLoginAttempts;
        }
        if (inactivityLockDays !== undefined && inactivityLockDays > 0) {
            updateData.inactivityLockDays = inactivityLockDays;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid parameters provided for update.' });
        }

        
        const updatedSettings = await SettingModel.findOneAndUpdate(
            {}, 
            { $set: updateData }, 
            { new: true, upsert: true } 
        );

        return res.status(200).json({
            message: 'System settings updated successfully.',
            settings: updatedSettings
        });

    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};