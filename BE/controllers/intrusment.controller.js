const Instrument = require('../models/intrusment.model');
const InstrumentConfiguration = require('../models/instrumentConfiguration.model');

  // =========================================================
  //  Create Instrument & Configuration
  // =========================================================
exports.createInstrument = async (req, res) => {
  try {
    const { name, instrument_code, description, status, config_id } = req.body;

    
    const lastInstrument = await Instrument.findOne({}, {}, { sort: { created_at: -1 } });

    
    let newNumber = 1;
    if (lastInstrument && lastInstrument.instrument_id) {
      const lastNumber = parseInt(lastInstrument.instrument_id.split('-')[1]);
      if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
    }

    
    const newInstrumentId = `INS-${String(newNumber).padStart(3, '0')}`;

    
    const instrument = await Instrument.create({
      instrument_id: newInstrumentId,
      name,
      instrument_code,
      description,
      status,
    });

    
    await InstrumentConfiguration.create({
      instrument_id: newInstrumentId,
      config_id,
    });

    res.status(201).json({
      message: 'Instrument & Configuration created successfully',
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
  //  Get all Instruments (with config)
  // =========================================================
exports.getAllInstruments = async (req, res) => {
  try {
    const instruments = await Instrument.aggregate([
      {
        $lookup: {
          from: 'instrument_configurations',
          localField: 'instrument_id',
          foreignField: 'instrument_id',
          as: 'config',
        },
      },
      { $unwind: { path: '$config', preserveNullAndEmptyArrays: true } },
    ]);

    res.status(200).json(instruments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instruments', error: error.message });
  }
};

  // =========================================================
  //  Get instrument by ID (with config)
  // =========================================================
exports.getInstrumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const instrument = await Instrument.aggregate([
      { $match: { instrument_id: id } },
      {
        $lookup: {
          from: 'instrument_configurations',
          localField: 'instrument_id',
          foreignField: 'instrument_id',
          as: 'config',
        },
      },
      { $unwind: { path: '$config', preserveNullAndEmptyArrays: true } },
    ]);

    if (!instrument || instrument.length === 0) {
      return res.status(404).json({ message: 'Instrument not found' });
    }

    res.status(200).json(instrument[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching instrument', error: error.message });
  }
};

  // =========================================================
  //  update Instrument & Configuration
  // =========================================================
exports.updateInstrument = async (req, res) => {
  try {
    const { id } = req.params; // instrument_id
    const { name, instrument_code, description, status, config_id } = req.body;

    
    const updatedInstrument = await Instrument.findOneAndUpdate(
      { instrument_id: id },
      { name, instrument_code, description, status },
      { new: true }
    );

    if (!updatedInstrument) return res.status(404).json({ message: 'Instrument not found' });

    
    await InstrumentConfiguration.findOneAndUpdate(
      { instrument_id: id },
      { config_id },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Instrument & Configuration updated successfully',
      updatedInstrument,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating instrument', error: error.message });
  }
};

  // =========================================================
  //  Delete Instrument & Configuration (xoa cung)
  // =========================================================
exports.deleteInstrument = async (req, res) => {
  try {
    const { id } = req.params;

    const instrument = await Instrument.findOneAndDelete({ instrument_id: id });
    if (!instrument) return res.status(404).json({ message: 'Instrument not found' });

    await InstrumentConfiguration.deleteMany({ instrument_id: id });

    res.status(200).json({ message: 'Instrument & Configuration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting instrument', error: error.message });
  }
};