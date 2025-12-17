const ReagentSupplyHistory = require('../models/reagentSupplyHistory.model');

  // =========================================================
  //  Create a new reagent supply record and update reagent inventory
  // =========================================================

const createSupplyRecord = async (req, res) => {
    try {
        const {
            reagent_name,
            catalog_number,
            vendor_name,
            vendor_id,
            po_number,
            order_date,
            receipt_date,
            quantity_received,
            unit_of_measure,
            lot_number,
            expiration_date,
            storage_location,
            status
        } = req.body;

      
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID not found in token'
            });
        }

        
        const AccountModel = require('../models/account.model');
        const doctorAccount = await AccountModel.findById(userId);
        
        if (!doctorAccount) {
            return res.status(404).json({
                success: false,
                message: 'Doctor account not found'
            });
        }

        
        const Reagent = require('../models/reagent.model');
        
        const reagent = await Reagent.findOne({ 
            reagent_name: reagent_name,
            catalog_number: catalog_number 
        });
        
        if (!reagent) {
            return res.status(404).json({
                success: false,
                message: `Reagent "${reagent_name}" with catalog "${catalog_number}" not found`
            });
        }

       
        const requiredFields = [
            'reagent_name', 'catalog_number', 'vendor_name', 'vendor_id', 
            'po_number', 'order_date', 'receipt_date', 'quantity_received', 
            'unit_of_measure', 'lot_number', 'expiration_date', 'storage_location'
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Field ${field} is required`
                });
            }
        }

        const generateSupplyId = async () => {
            const count = await ReagentSupplyHistory.countDocuments();
            const nextNumber = count + 1;
            return `SUP${nextNumber}`;
        };

        const supply_id = await generateSupplyId();

        const newSupplyRecord = new ReagentSupplyHistory({
            supply_id,
            reagent_name,
            catalog_number,
            vendor_name,
            vendor_id,
            po_number,
            order_date: new Date(order_date),
            receipt_date: new Date(receipt_date),
            quantity_received,
            unit_of_measure,
            lot_number,
            expiration_date: new Date(expiration_date),
            received_by_doctor: doctorAccount.fullName || doctorAccount.username,
            storage_location,
            status: status || 'received'
        });

        const savedRecord = await newSupplyRecord.save();

        const supplyStatus = status || 'received';
        let inventoryUpdated = false;
        let updatedReagent = reagent;
        const previousQuantity = reagent.quantity_available;
        
        if (supplyStatus === 'received') {
            const receivedQuantity = parseFloat(quantity_received.toString());
            
            // Thêm batch mới vào reagent
            const newBatch = {
                lot_number: lot_number,
                quantity: receivedQuantity,
                expiration_date: new Date(expiration_date),
                supply_id: supply_id,
                storage_location: storage_location,
                received_date: new Date(receipt_date)
            };
            
            reagent.batches.push(newBatch);
            
            // Tính lại tổng số lượng
            reagent.quantity_available = reagent.batches.reduce((total, batch) => total + batch.quantity, 0);
            
            // Cập nhật hạn sử dụng gần nhất
            const validBatches = reagent.batches.filter(batch => batch.quantity > 0);
            if (validBatches.length > 0) {
                const sortedBatches = validBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
                reagent.nearest_expiration_date = sortedBatches[0].expiration_date;
            }
            
            updatedReagent = await reagent.save();
            inventoryUpdated = true;
        } else if (supplyStatus === 'returned') {
            // Trừ số lượng theo batch khi hàng bị trả lại
            const returnedQuantity = parseFloat(quantity_received.toString());
            
            // Tìm batch có cùng lot_number để trừ số lượng
            const batchIndex = reagent.batches.findIndex(batch => 
                batch.lot_number === lot_number && batch.quantity >= returnedQuantity
            );
            
            if (batchIndex !== -1) {
                // Trừ số lượng từ batch
                reagent.batches[batchIndex].quantity -= returnedQuantity;
                
                // Nếu batch về 0 thì xóa batch
                if (reagent.batches[batchIndex].quantity === 0) {
                    reagent.batches.splice(batchIndex, 1);
                }
                
                // Tính lại tổng số lượng
                reagent.quantity_available = reagent.batches.reduce((total, batch) => total + batch.quantity, 0);
                
                // Cập nhật hạn sử dụng gần nhất
                const validBatches = reagent.batches.filter(batch => batch.quantity > 0);
                if (validBatches.length > 0) {
                    const sortedBatches = validBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
                    reagent.nearest_expiration_date = sortedBatches[0].expiration_date;
                } else {
                    reagent.nearest_expiration_date = null;
                }
                
                updatedReagent = await reagent.save();
                inventoryUpdated = true;
            } else {
                // Không tìm thấy batch hoặc số lượng không đủ
                return res.status(400).json({
                    success: false,
                    message: `Cannot return ${returnedQuantity} units. No matching batch with lot ${lot_number} or insufficient quantity in batch.`,
                    data: {
                        available_batches: reagent.batches.map(b => ({
                            lot_number: b.lot_number,
                            quantity: b.quantity
                        }))
                    }
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: inventoryUpdated 
                ? `Reagent supply record created and inventory ${supplyStatus === 'returned' ? 'decreased' : 'updated'} successfully`
                : 'Reagent supply record created (inventory not updated for partial shipment)',
            data: {
                supply_record: savedRecord,
                reagent_name: reagent_name,
                previous_quantity: previousQuantity,
                quantity_change: parseFloat(quantity_received.toString()) * (supplyStatus === 'returned' ? -1 : 1),
                new_total_quantity: updatedReagent.quantity_available,
                inventory_updated: inventoryUpdated,
                status: supplyStatus
            }
        });
    } catch (error) {
        console.error('Error creating supply record:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


const getAllSupplyRecords = async (req, res) => {
    try {
        const {
            reagent_name,
            vendor_name,
            status,
            from_date,
            to_date,
            page = 1,
            limit = 10
        } = req.query;

      
        const filter = {};
        
        if (reagent_name) filter.reagent_name = new RegExp(reagent_name, 'i');
        if (vendor_name) filter.vendor_name = new RegExp(vendor_name, 'i');
        if (status) filter.status = status;
        
        if (from_date || to_date) {
            filter.receipt_date = {};
            if (from_date) filter.receipt_date.$gte = new Date(from_date);
            if (to_date) filter.receipt_date.$lte = new Date(to_date);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const records = await ReagentSupplyHistory
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ReagentSupplyHistory.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: 'Supply records retrieved successfully',
            data: {
                records,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(total / parseInt(limit)),
                    total_records: total,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting supply records:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

  // =========================================================
  // Get reagent supply record by supply_id
  // =========================================================

const getSupplyRecordById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await ReagentSupplyHistory
            .findOne({ supply_id: id });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: 'Supply record not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Supply record retrieved successfully',
            data: record
        });
    } catch (error) {
        console.error('Error getting supply record:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

  // =========================================================
  //  Update supply record by supply_id
  // =========================================================

const updateSupplyRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        const oldRecord = await ReagentSupplyHistory.findOne({ supply_id: id });
        
        if (!oldRecord) {
            return res.status(404).json({
                success: false,
                message: 'Supply record not found'
            });
        }

        delete updateData.supply_id;
        delete updateData.reagent_name;
        delete updateData.catalog_number;

       
        if (updateData.status) {
            const validStatuses = ['received', 'partial_shipment', 'returned'];
            if (!validStatuses.includes(updateData.status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
                });
            }
        }

        
        if (updateData.order_date) updateData.order_date = new Date(updateData.order_date);
        if (updateData.receipt_date) updateData.receipt_date = new Date(updateData.receipt_date);
        if (updateData.expiration_date) updateData.expiration_date = new Date(updateData.expiration_date);

        const oldStatus = oldRecord.status;
        const newStatus = updateData.status || oldStatus;
        
        let quantityDifference = 0;
        if (updateData.quantity_received !== undefined) {
            const oldQuantity = parseFloat(oldRecord.quantity_received.toString());
            const newQuantity = parseFloat(updateData.quantity_received.toString());
            quantityDifference = newQuantity - oldQuantity;
        }

        const updatedRecord = await ReagentSupplyHistory
            .findOneAndUpdate(
                { supply_id: id },
                updateData,
                { new: true, runValidators: true }
            );

        if (!updatedRecord) {
            return res.status(404).json({
                success: false,
                message: 'Supply record not found'
            });
        }

        const Reagent = require('../models/reagent.model');
        const reagent = await Reagent.findOne({
            reagent_name: oldRecord.reagent_name,
            catalog_number: oldRecord.catalog_number
        });

        if (reagent) {
            let batchUpdated = false;
            const fullQuantity = parseFloat(updatedRecord.quantity_received.toString());

            // Tìm batch tương ứng với supply_id
            const batchIndex = reagent.batches.findIndex(batch => batch.supply_id === oldRecord.supply_id);

            if (oldStatus !== newStatus) {
                if (oldStatus === 'received' && (newStatus === 'partial_shipment' || newStatus === 'returned')) {
                    // Xóa batch khỏi reagent khi chuyển từ received sang partial_shipment hoặc returned
                    if (batchIndex !== -1) {
                        reagent.batches.splice(batchIndex, 1);
                        batchUpdated = true;
                    }
                } else if (oldStatus === 'partial_shipment' && newStatus === 'received') {
                    // Thêm batch mới khi chuyển từ partial_shipment sang received
                    const newBatch = {
                        lot_number: updatedRecord.lot_number,
                        quantity: fullQuantity,
                        expiration_date: updatedRecord.expiration_date,
                        supply_id: updatedRecord.supply_id,
                        storage_location: updatedRecord.storage_location,
                        received_date: updatedRecord.receipt_date
                    };
                    reagent.batches.push(newBatch);
                    batchUpdated = true;
                } else if (oldStatus === 'partial_shipment' && newStatus === 'returned') {
                    // Trừ số lượng khi chuyển từ partial_shipment sang returned
                    const returnedQuantity = fullQuantity;
                    const targetBatch = reagent.batches.find(batch => 
                        batch.lot_number === updatedRecord.lot_number && batch.quantity >= returnedQuantity
                    );
                    
                    if (targetBatch) {
                        targetBatch.quantity -= returnedQuantity;
                        if (targetBatch.quantity === 0) {
                            const idx = reagent.batches.indexOf(targetBatch);
                            reagent.batches.splice(idx, 1);
                        }
                        batchUpdated = true;
                    }
                } else if (oldStatus === 'returned' && newStatus === 'received') {
                    // Thêm lại batch khi chuyển từ returned sang received
                    const newBatch = {
                        lot_number: updatedRecord.lot_number,
                        quantity: fullQuantity,
                        expiration_date: updatedRecord.expiration_date,
                        supply_id: updatedRecord.supply_id,
                        storage_location: updatedRecord.storage_location,
                        received_date: updatedRecord.receipt_date
                    };
                    reagent.batches.push(newBatch);
                    batchUpdated = true;
                } else if (oldStatus === 'returned' && newStatus === 'partial_shipment') {
                    // Cộng lại số lượng khi chuyển từ returned sang partial_shipment
                    // (vì returned đã trừ, partial_shipment không ảnh hưởng)
                    const returnedQuantity = fullQuantity;
                    const targetBatch = reagent.batches.find(batch => batch.lot_number === updatedRecord.lot_number);
                    
                    if (targetBatch) {
                        targetBatch.quantity += returnedQuantity;
                        batchUpdated = true;
                    }
                }
            } 
            else if (newStatus === 'received' && quantityDifference !== 0 && batchIndex !== -1) {
                // Cập nhật quantity của batch khi status vẫn là received
                reagent.batches[batchIndex].quantity = fullQuantity;
                batchUpdated = true;
            }

            if (batchUpdated) {
                // Tính lại tổng số lượng và nearest_expiration_date
                reagent.quantity_available = reagent.batches.reduce((total, batch) => total + batch.quantity, 0);
                const validBatches = reagent.batches.filter(batch => batch.quantity > 0);
                if (validBatches.length > 0) {
                    const sortedBatches = validBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
                    reagent.nearest_expiration_date = sortedBatches[0].expiration_date;
                } else {
                    reagent.nearest_expiration_date = null;
                }
                
                const updatedReagent = await reagent.save();

                return res.status(200).json({
                    success: true,
                    message: 'Supply record and reagent batch updated successfully',
                    data: {
                        supply_record: updatedRecord,
                        reagent_name: oldRecord.reagent_name,
                        batch_updated: true,
                        new_reagent_quantity: updatedReagent.quantity_available,
                        nearest_expiration: updatedReagent.nearest_expiration_date,
                        status_changed: oldStatus !== newStatus
                    }
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Supply record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        console.error('Error updating supply record:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

  // =========================================================
  //  Delete supply record by supply_id and revert inventory
  // =========================================================

const deleteSupplyRecord = async (req, res) => {
    try {
        const { id } = req.params;

       
        const supplyRecord = await ReagentSupplyHistory.findOne({ supply_id: id });
        
        if (!supplyRecord) {
            return res.status(404).json({
                success: false,
                message: 'Supply record not found'
            });
        }

       
        const Reagent = require('../models/reagent.model');
        const reagent = await Reagent.findOne({
            reagent_name: supplyRecord.reagent_name,
            catalog_number: supplyRecord.catalog_number
        });

        let quantityReverted = 0;
        let inventoryUpdated = false;

        if (reagent && supplyRecord.status === 'received') {
            // Xóa batch khi delete record với status 'received'
            const batchIndex = reagent.batches.findIndex(batch => batch.supply_id === supplyRecord.supply_id);
            
            if (batchIndex !== -1) {
                quantityReverted = reagent.batches[batchIndex].quantity;
                reagent.batches.splice(batchIndex, 1);
                
                // Tính lại tổng số lượng và nearest_expiration_date
                reagent.quantity_available = reagent.batches.reduce((total, batch) => total + batch.quantity, 0);
                const validBatches = reagent.batches.filter(batch => batch.quantity > 0);
                if (validBatches.length > 0) {
                    const sortedBatches = validBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
                    reagent.nearest_expiration_date = sortedBatches[0].expiration_date;
                } else {
                    reagent.nearest_expiration_date = null;
                }
                
                await reagent.save();
                inventoryUpdated = true;
            }
        } else if (reagent && supplyRecord.status === 'returned') {
            // Cộng lại số lượng khi delete record với status 'returned' (revert the return)
            const returnedQuantity = parseFloat(supplyRecord.quantity_received.toString());
            const batchIndex = reagent.batches.findIndex(batch => batch.lot_number === supplyRecord.lot_number);
            
            if (batchIndex !== -1) {
                // Cộng lại vào batch hiện có
                reagent.batches[batchIndex].quantity += returnedQuantity;
                quantityReverted = returnedQuantity;
            } else {
                // Tạo lại batch nếu không tồn tại
                const newBatch = {
                    lot_number: supplyRecord.lot_number,
                    quantity: returnedQuantity,
                    expiration_date: supplyRecord.expiration_date,
                    supply_id: supplyRecord.supply_id,
                    storage_location: supplyRecord.storage_location,
                    received_date: supplyRecord.receipt_date
                };
                reagent.batches.push(newBatch);
                quantityReverted = returnedQuantity;
            }
            
            // Tính lại tổng số lượng và nearest_expiration_date
            reagent.quantity_available = reagent.batches.reduce((total, batch) => total + batch.quantity, 0);
            const validBatches = reagent.batches.filter(batch => batch.quantity > 0);
            if (validBatches.length > 0) {
                const sortedBatches = validBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
                reagent.nearest_expiration_date = sortedBatches[0].expiration_date;
            }
            
            await reagent.save();
            inventoryUpdated = true;
        }

        
        const deletedRecord = await ReagentSupplyHistory.findOneAndDelete({ supply_id: id });

        return res.status(200).json({
            success: true,
            message: inventoryUpdated 
                ? `Supply record deleted and inventory ${supplyRecord.status === 'returned' ? 'restored' : 'reverted'} successfully`
                : `Supply record deleted (inventory not updated - was ${supplyRecord.status})`,
            data: {
                deleted_record: deletedRecord,
                reagent_quantity_reverted: quantityReverted,
                inventory_updated: inventoryUpdated,
                original_status: supplyRecord.status,
                revert_type: supplyRecord.status === 'returned' ? 'added_back' : 'removed'
            }
        });
    } catch (error) {
        console.error('Error deleting supply record:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createSupplyRecord,
    getAllSupplyRecords,
    getSupplyRecordById,
    updateSupplyRecord,
    deleteSupplyRecord
};