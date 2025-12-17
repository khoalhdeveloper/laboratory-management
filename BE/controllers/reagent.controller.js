const Reagent = require('../models/reagent.model');
const { pushNotification } = require('../helpers/notification.helper');

const getAllReagents = async (req, res) => {
  try {
    const reagents = await Reagent.find().sort({ reagent_name: 1 });

    // Chuẩn bị dữ liệu với thông tin hạn sử dụng
    const reagentsWithExpirationInfo = reagents.map(reagent => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + 30);
      
      const expiringBatches = reagent.batches ? reagent.batches.filter(batch => 
        batch.quantity > 0 && new Date(batch.expiration_date) <= cutoffDate && new Date(batch.expiration_date) >= new Date()
      ) : [];
      
      const expiredBatches = reagent.batches ? reagent.batches.filter(batch => 
        batch.quantity > 0 && new Date(batch.expiration_date) < new Date()
      ) : [];

      return {
        _id: reagent._id,
        reagent_name: reagent.reagent_name,
        catalog_number: reagent.catalog_number,
        manufacturer: reagent.manufacturer,
        cas_number: reagent.cas_number,
        description: reagent.description,
        quantity_available: reagent.quantity_available,
        unit: reagent.unit,
        nearest_expiration_date: reagent.nearest_expiration_date,
        batch_count: reagent.batches ? reagent.batches.filter(b => b.quantity > 0).length : 0,
        expiring_soon_count: expiringBatches.length,
        expired_count: expiredBatches.length,
        expiring_soon_quantity: expiringBatches.reduce((sum, batch) => sum + batch.quantity, 0),
        expired_quantity: expiredBatches.reduce((sum, batch) => sum + batch.quantity, 0),
        createdAt: reagent.createdAt,
        updatedAt: reagent.updatedAt
      };
    });

    // Cảnh báo tồn kho thấp
    const lowStock = reagentsWithExpirationInfo.filter(r => r.quantity_available <= 10);
    
    // Cảnh báo sắp hết hạn
    const expiringSoon = reagentsWithExpirationInfo.filter(r => r.expiring_soon_count > 0);
    
    // Cảnh báo đã hết hạn
    const expired = reagentsWithExpirationInfo.filter(r => r.expired_count > 0);

    // Gửi thông báo cho tồn kho thấp
    if (lowStock.length > 0) {
      const lowStockNames = lowStock
        .map(r => `${r.reagent_name} (${r.quantity_available} ${r.unit})`)
        .join(', ');

      await pushNotification({
        userid: 'Warehouse',
        title: 'Warning: Low Stock Reagents',
        message: `Low stock reagents: ${lowStockNames}`,
        type: 'warning'
      });
    }

    // Gửi thông báo cho thuốc sắp hết hạn
    if (expiringSoon.length > 0) {
      const expiringNames = expiringSoon
        .map(r => `${r.reagent_name} (${r.expiring_soon_quantity} ${r.unit})`)
        .join(', ');

      await pushNotification({
        userid: 'Warehouse',
        title: 'Warning: Reagents Expiring Soon',
        message: `Reagents expiring within 30 days: ${expiringNames}`,
        type: 'warning'
      });
    }

    // Gửi thông báo cho thuốc đã hết hạn
    if (expired.length > 0) {
      const expiredNames = expired
        .map(r => `${r.reagent_name} (${r.expired_quantity} ${r.unit})`)
        .join(', ');

      await pushNotification({
        userid: 'Warehouse',
        title: 'Alert: Expired Reagents Found',
        message: `Expired reagents detected: ${expiredNames}`,
        type: 'error'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reagents retrieved successfully',
      data: reagentsWithExpirationInfo,
      summary: {
        total_reagents: reagentsWithExpirationInfo.length,
        low_stock_count: lowStock.length,
        expiring_soon_count: expiringSoon.length,
        expired_count: expired.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving reagents',
      error: error.message
    });
  }
};

const getReagentsByName = async (req, res) => {
    try {
        const { name } = req.params;
        const reagents = await Reagent.find({
            reagent_name: { $regex: name, $options: 'i' }
        }).sort({ reagent_name: 1 });

        res.status(200).json({
            success: true,
            message: 'Reagents found successfully',
            data: reagents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching reagents',
            error: error.message
        });
    }
};

const createReagent = async (req, res) => {
    try {
        const {
            reagent_name,
            catalog_number,
            manufacturer,
            cas_number,
            description,
            unit
        } = req.body;

       
        const existingReagent = await Reagent.findOne({ reagent_name });
        if (existingReagent) {
            return res.status(400).json({
                success: false,
                message: 'Reagent with this name already exists'
            });
        }

        const newReagent = new Reagent({
            reagent_name,
            catalog_number,
            manufacturer,
            cas_number,
            description,
            quantity_available: 0, // Sẽ được tính từ batches
            unit: unit || 'mL',
            batches: [], // Khởi tạo mảng batches rỗng
            nearest_expiration_date: null
        });

        const savedReagent = await newReagent.save();

        res.status(201).json({
            success: true,
            message: 'Reagent created successfully. Use supply management to add stock with expiration dates.',
            data: savedReagent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating reagent',
            error: error.message
        });
    }
};
const updateReagentByName = async (req, res) => {
    try {
        const { name } = req.params;
        const updateData = req.body;

        const updatedReagent = await Reagent.findOneAndUpdate(
            { reagent_name: name },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedReagent) {
            return res.status(404).json({
                success: false,
                message: 'Reagent not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reagent updated successfully',
            data: updatedReagent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating reagent',
            error: error.message
        });
    }
};
const deleteReagentByName = async (req, res) => {
    try {
        const { name } = req.params;

        const deletedReagent = await Reagent.findOneAndDelete({ 
            reagent_name: name 
        });

        if (!deletedReagent) {
            return res.status(404).json({
                success: false,
                message: 'Reagent not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reagent deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting reagent',
            error: error.message
        });
    }
};

// Lấy thông tin chi tiết về các batch của reagent
const getReagentBatches = async (req, res) => {
    try {
        const { name } = req.params;
        
        const reagent = await Reagent.findOne({ reagent_name: name });
        
        if (!reagent) {
            return res.status(404).json({
                success: false,
                message: 'Reagent not found'
            });
        }

        // Sắp xếp batch theo hạn sử dụng
        const sortedBatches = reagent.batches
            ? reagent.batches
                .filter(batch => batch.quantity > 0)
                .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
            : [];

        res.status(200).json({
            success: true,
            message: 'Reagent batches retrieved successfully',
            data: {
                reagent_name: reagent.reagent_name,
                total_quantity: reagent.quantity_available,
                unit: reagent.unit,
                nearest_expiration_date: reagent.nearest_expiration_date,
                batches: sortedBatches,
                batch_count: sortedBatches.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving reagent batches',
            error: error.message
        });
    }
};

// Lấy danh sách reagent sắp hết hạn
const getExpiringReagents = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const daysAhead = parseInt(days);
        
        const reagents = await Reagent.find({ 
            'batches.0': { $exists: true } // Chỉ lấy reagent có batch
        });

        const expiringReagents = [];

        for (let reagent of reagents) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
            
            const expiringBatches = reagent.batches
                ? reagent.batches.filter(batch => 
                    batch.quantity > 0 && 
                    new Date(batch.expiration_date) <= cutoffDate &&
                    new Date(batch.expiration_date) >= new Date()
                  ).sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
                : [];
                
            if (expiringBatches.length > 0) {
                expiringReagents.push({
                    reagent_name: reagent.reagent_name,
                    catalog_number: reagent.catalog_number,
                    total_quantity: reagent.quantity_available,
                    unit: reagent.unit,
                    nearest_expiration_date: reagent.nearest_expiration_date,
                    expiring_batches: expiringBatches,
                    total_expiring_quantity: expiringBatches.reduce((sum, batch) => sum + batch.quantity, 0)
                });
            }
        }

        // Sắp xếp theo hạn sử dụng gần nhất
        expiringReagents.sort((a, b) => 
            new Date(a.nearest_expiration_date) - new Date(b.nearest_expiration_date)
        );

        res.status(200).json({
            success: true,
            message: `Reagents expiring within ${daysAhead} days retrieved successfully`,
            data: {
                expiring_reagents: expiringReagents,
                count: expiringReagents.length,
                days_ahead: daysAhead
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving expiring reagents',
            error: error.message
        });
    }
};

module.exports = {
    getAllReagents,
    getReagentsByName,
    createReagent,
    updateReagentByName,
    deleteReagentByName,
    getReagentBatches,
    getExpiringReagents
};