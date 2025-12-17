const Vendor = require('../models/vendor.model');

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find(
            {}, 
            { vendor_id: 1, vendor_name: 1, contact_info: 1 }
        ).sort({ vendor_name: 1 });


        return res.status(200).json({
            success: true,
            message: 'Vendors retrieved successfully',
            data: vendors
        });
    } catch (error) {
        console.error('Error getting vendors:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
const getVendorById = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        
        const vendor = await Vendor.findOne({ vendor_id });
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: `Vendor with vendor_id "${vendor_id}" not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vendor retrieved successfully',
            data: vendor
        });
    } catch (error) {
        console.error('Error getting vendor:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const createVendor = async (req, res) => {
    try {
        const { vendor_id, vendor_name, contact_info, address } = req.body;

        
        const existingVendor = await Vendor.findOne({ vendor_id });
        if (existingVendor) {
            return res.status(400).json({
                success: false,
                message: 'Vendor ID already exists'
            });
        }

        const newVendor = new Vendor({
            vendor_id,
            vendor_name,
            contact_info,
            address
        });

        const savedVendor = await newVendor.save();

        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            data: savedVendor
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateVendor = async (req, res) => {
    try {
        const { vendor_id } = req.params;
       
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body is required'
            });
        }

        const { vendor_name, contact_info } = req.body;

      
        const updateData = {};
        if (vendor_name !== undefined) updateData.vendor_name = vendor_name;
        if (contact_info !== undefined) updateData.contact_info = contact_info;

        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            });
        }

        const updatedVendor = await Vendor.findOneAndUpdate(
            { vendor_id },
            updateData,
            { new: true }
        );

        if (!updatedVendor) {
            return res.status(404).json({
                success: false,
                message: `Vendor with vendor_id "${vendor_id}" not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vendor updated successfully',
            data: updatedVendor
        });
    } catch (error) {
        console.error('Error updating vendor:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        
        const deletedVendor = await Vendor.findOneAndDelete(
            { vendor_id }
        );

        if (!deletedVendor) {
            return res.status(404).json({
                success: false,
                message: `Vendor with vendor_id "${vendor_id}" not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Vendor "${deletedVendor.vendor_name}" (${vendor_id}) deleted successfully`,
            data: deletedVendor
        });
    } catch (error) {
        console.error('Error deleting vendor:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getAllVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor
};