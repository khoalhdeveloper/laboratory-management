const Instrument = require('../models/intrusment.model');
const TestResultModel = require('../models/testResult.model');
const TestOrderModel = require('../models/testOrder.model');

  // =========================================================
  //  Create Instrument
  // =========================================================
exports.createInstrument = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      category, 
      manufacturer, 
      model, 
      serial_number, 
      room, 
      status,
      last_check,
      next_check
    } = req.body;

    
    const lastInstrument = await Instrument.findOne({}, { instrument_id: 1 }, { sort: { instrument_id: -1 } });

    let newNumber = 1001;
    if (lastInstrument && lastInstrument.instrument_id) {
      const lastNumber = parseInt(lastInstrument.instrument_id.split('-')[1]);
      if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
    }

    
    let newInstrumentId;
    let attempts = 0;
    
    do {
      newInstrumentId = `EQ-${newNumber}`;
      const existing = await Instrument.findOne({ instrument_id: newInstrumentId });
      
      if (!existing) break;
      
      newNumber++;
      attempts++;
    } while (attempts < 100);

    if (attempts >= 100) {
      return res.status(500).json({
        message: 'Unable to generate unique instrument ID',
        error: 'Too many attempts'
      });
    }

    const instrument = await Instrument.create({
      instrument_id: newInstrumentId,
      name,
      type,
      category,
      manufacturer,
      model,
      serial_number,
      room,
      status: status || 'Available',
      last_check: last_check ? new Date(last_check) : null,
      next_check: next_check ? new Date(next_check) : null,
    });


    res.status(201).json({
      message: 'Instrument created successfully',
      instrument,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating instrument',
      error: error.message,
    });
  }
};

  // =========================================================
  //  Get all Instruments
  // =========================================================
exports.getAllInstruments = async (req, res) => {
  try {
    const { status, type, category, room } = req.query;
    
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (room) filter.room = room;

    const instruments = await Instrument.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Instruments retrieved successfully',
      count: instruments.length,
      instruments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instruments', error: error.message });
  }
};

  // =========================================================
  //  Get instrument by ID
  // =========================================================
exports.getInstrumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const instrument = await Instrument.findOne({ instrument_id: id });

    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    res.status(200).json({
      message: 'Instrument retrieved successfully',
      instrument
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instrument', error: error.message });
  }
};

  // =========================================================
  //  Update Instrument
  // =========================================================
exports.updateInstrument = async (req, res) => {
  try {
    const { id } = req.params; 
    const { 
      name, 
      type, 
      category, 
      manufacturer, 
      model, 
      serial_number, 
      room, 
      status,
      last_check,
      next_check
    } = req.body;

    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (model !== undefined) updateData.model = model;
    if (serial_number !== undefined) updateData.serial_number = serial_number;
    if (room !== undefined) updateData.room = room;
    if (status !== undefined) updateData.status = status;
    if (last_check !== undefined) updateData.last_check = last_check ? new Date(last_check) : null;
    if (next_check !== undefined) updateData.next_check = next_check ? new Date(next_check) : null;

    const updatedInstrument = await Instrument.findOneAndUpdate(
      { instrument_id: id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedInstrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    res.status(200).json({
      message: 'Instrument updated successfully',
      instrument: updatedInstrument,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating instrument', error: error.message });
  }
};

  // =========================================================
  //  Delete Instrument
  // =========================================================
exports.deleteInstrument = async (req, res) => {
  try {
    const { id } = req.params;

    const instrument = await Instrument.findOneAndDelete({ instrument_id: id });
    
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    res.status(200).json({ 
      message: 'Instrument deleted successfully',
      deletedInstrument: instrument
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting instrument', error: error.message });
  }
};

// =========================================================
//  Get instrument test history
// =========================================================
exports.getInstrumentTestHistory = async (req, res) => {
  try {
    const { id } = req.params; 
    const { page = 1, limit = 10 } = req.query;

    
    const instrument = await Instrument.findOne({ instrument_id: id });
    if (!instrument) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    
    const testResults = await TestResultModel.find({ 
      instrument_id: id 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    
    const totalResults = await TestResultModel.countDocuments({ instrument_id: id });

    if (testResults.length === 0) {
      return res.status(404).json({ 
        message: 'No test results found for this instrument' 
      });
    }

    
    const orderCodes = testResults.map(result => result.order_code);

    
    const testOrders = await TestOrderModel.find({ 
      order_code: { $in: orderCodes } 
    });

    
    const testHistory = testResults.map(result => {
      const relatedOrder = testOrders.find(order => order.order_code === result.order_code);
      return {
        testResult: {
          result_summary: result.result_summary,
          result_details: result.result_details,
          wbc_value: result.wbc_value,
          rbc_value: result.rbc_value,
          hgb_value: result.hgb_value,
          hct_value: result.hct_value,
          plt_value: result.plt_value,
          mcv_value: result.mcv_value,
          mch_value: result.mch_value,
          mchc_value: result.mchc_value,
          flag: result.flag,
          status: result.status,
          doctor_name: result.doctor_name,
          createdAt: result.createdAt
        },
        testOrder: {
          order_code: relatedOrder?.order_code || 'N/A',
          patient_name: relatedOrder?.patient_name || 'N/A',
          userid: relatedOrder?.userid || 'N/A',
          status: relatedOrder?.status || 'N/A',
          test_type: relatedOrder?.test_type || 'N/A',
          createdAt: relatedOrder?.createdAt || result.createdAt
        }
      };
    });

    res.status(200).json({
      message: 'Instrument test history retrieved successfully',
      instrument: {
        instrument_id: instrument.instrument_id,
        name: instrument.name,
        type: instrument.type,
        category: instrument.category,
        status: instrument.status
      },
      testHistory,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalResults / parseInt(limit)),
        total_results: totalResults,
        results_per_page: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching instrument test history', 
      error: error.message 
    });
  }
};