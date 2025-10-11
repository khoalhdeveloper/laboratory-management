const Role = require('../models/roles.model');

/**
 * Get privileges of a role by role_code
 */
const getRolePrivileges = async (req, res) => {
    try {
        const { roleCode } = req.params;
        
        const role = await Role.findOne({ role: roleCode.toLowerCase() });
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Role privileges retrieved successfully',
            data: {
                role: role.role,
                privileges: role.privileges
            }
        });
    } catch (error) {
        console.error('Error getting role privileges:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update privileges of a role by role_code
 */
const updateRolePrivileges = async (req, res) => {
    try {
        const { roleCode } = req.params;
        const { privileges } = req.body;
        
        // Validate input
        if (!privileges || !Array.isArray(privileges)) {
            return res.status(400).json({
                success: false,
                message: 'Privileges must be an array'
            });
        }
        
        // Find and update role
        const role = await Role.findOneAndUpdate(
            { role: roleCode.toLowerCase() },
            { privileges: privileges },
            { new: true }
        );
        
        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Role privileges updated successfully',
            data: {
                role: role.role,
                privileges: role.privileges
            }
        });
    } catch (error) {
        console.error('Error updating role privileges:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getRolePrivileges,
    updateRolePrivileges
};
