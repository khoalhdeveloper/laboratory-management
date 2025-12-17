const AccountModel = require('../models/account.model');
const SettingModel = require('../models/setting.model');
const { getVNTime } = require('../helpers/time.helper');

exports.checkSessionTimeout = async (req, res, next) => {
    try {
        const userid = req.user?.userid;
        if (!userid) return res.status(401).json({ message: 'Unauthorized' });

        const account = await AccountModel.findOne({ userid: userid });
        if (!account) return res.status(401).json({ message: 'Account not found' });

        const settings = await SettingModel.findOne({});
        const sessionTimeoutMinutes = settings?.sessionTimeoutMinutes || 15; 

        const now = getVNTime().getTime();
        const lastActive = new Date(account.lastActivity).getTime();
        
        const diffMinutes = (now - lastActive) / (1000 * 60); 

        if (diffMinutes > sessionTimeoutMinutes) {
            return res.status(440).json({ message: 'Session expired. Please log in again.' });
        }

        account.lastActivity = getVNTime();
        await account.save();

        next();
    } catch (error) {
        console.error('Session check error:', error);
        return res.status(500).json({ message: 'Internal server error during session check' });
    }
};
