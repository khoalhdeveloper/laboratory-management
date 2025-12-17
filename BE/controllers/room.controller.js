const Room = require('../models/room.model');

// Get all rooms with optional filters
const getRooms = async (req, res) => {
    try {
        const { type, status, floor, search } = req.query;
        let query = {};

        // Apply filters (except status - we'll filter that after updating)
        if (type && type !== 'all') {
            query.type = type;
        }
        if (floor) {
            query.floor = parseInt(floor);
        }
        if (search) {
            query.$or = [
                { roomNumber: { $regex: search, $options: 'i' } },
                { 'patients.name': { $regex: search, $options: 'i' } }
            ];
        }

        const rooms = await Room.find(query).select('-__v').sort({ floor: 1, roomNumber: 1 });

        // Update status for each room based on current occupied vs capacity
        let updatedRooms = rooms.map(room => {
            const roomObj = room.toObject();
            if (roomObj.occupied >= roomObj.capacity) {
                roomObj.status = 'full';
            } else if (roomObj.status === 'full' && roomObj.occupied < roomObj.capacity) {
                roomObj.status = 'available';
            }
            return roomObj;
        });

        // Apply status filter AFTER updating status
        if (status && status !== 'all') {
            updatedRooms = updatedRooms.filter(room => room.status === status);
        }

        res.json({
            success: true,
            count: updatedRooms.length,
            data: updatedRooms
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching rooms',
            error: error.message
        });
    }
};

// Get single room by roomNumber
const getRoomByNumber = async (req, res) => {
    try {
        const room = await Room.findOne({ roomNumber: req.params.roomNumber }).select('-__v');
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            data: room
        });
    } catch (error) {
        console.error('Get room by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching room',
            error: error.message
        });
    }
};

// Create new room
const createRoom = async (req, res) => {
    try {
        const { roomNumber, floor, type, capacity, notes } = req.body;

        // Validate room type
        const validTypes = ['ICU', 'General', 'VIP', 'Emergency'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `Invalid room type. Valid types: ${validTypes.join(', ')}`
            });
        }

        // Check if room number already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: 'Room number already exists'
            });
        }

        const room = new Room({
            roomNumber,
            floor,
            type,
            capacity,
            notes: notes || ''
        });

        await room.save();

        // Remove __v from response
        const roomResponse = room.toObject();
        delete roomResponse.__v;

        res.status(201).json({
            success: true,
            message: 'Room created successfully',
            data: roomResponse
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating room',
            error: error.message
        });
    }
};

// Update room information
const updateRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const updateData = req.body;

        // Don't allow updating patients through this endpoint
        delete updateData.patients;
        delete updateData.occupied;
        delete updateData.roomNumber; // Don't allow changing room number

        const room = await Room.findOneAndUpdate(
            { roomNumber },
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.json({
            success: true,
            message: 'Room updated successfully',
            data: room
        });
    } catch (error) {
        console.error('Update room error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating room',
            error: error.message
        });
    }
};

// Delete room
const deleteRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;

        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check if room has patients
        if (room.patients && room.patients.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete room with patients. Please transfer patients first.'
            });
        }

        await Room.findOneAndDelete({ roomNumber });

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting room',
            error: error.message
        });
    }
};

// Add patient to room
const addPatientToRoom = async (req, res) => {
    try {
        const { roomNumber } = req.params;
        const patientData = req.body;

        const room = await Room.findOne({ roomNumber }).select('-__v');
        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room ${roomNumber} not found. Please create the room first.`
            });
        }

        // Check room capacity based on room type
        const maxCapacity = room.type === 'VIP' ? 1 : 6;
        if (room.patients.length >= maxCapacity) {
            return res.status(400).json({
                success: false,
                message: `Room is at full capacity (maximum ${maxCapacity} patients for ${room.type} room)`
            });
        }

        // Add patient to room
        room.patients.push(patientData);
        await room.save();
        
        // Remove __v from response
        const roomResponse = room.toObject();
        delete roomResponse.__v;

        res.json({
            success: true,
            message: 'Patient added to room successfully',
            data: roomResponse
        });
    } catch (error) {
        console.error('Add patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding patient to room',
            error: error.message
        });
    }
};

// Remove patient from room
const removePatientFromRoom = async (req, res) => {
    try {
        const { roomNumber, patientId } = req.params;

        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Remove patient from room
        room.patients = room.patients.filter(
            patient => patient._id.toString() !== patientId
        );
        await room.save();
        
        // Remove __v from response
        const roomResponse = room.toObject();
        delete roomResponse.__v;

        res.json({
            success: true,
            message: 'Patient removed from room successfully',
            data: roomResponse
        });
    } catch (error) {
        console.error('Remove patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing patient from room',
            error: error.message
        });
    }
};

// Update patient in room
const updatePatientInRoom = async (req, res) => {
    try {
        const { roomNumber, patientId } = req.params;
        const updateData = req.body;

        const room = await Room.findOne({ roomNumber });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Find and update patient
        const patientIndex = room.patients.findIndex(
            patient => patient._id.toString() === patientId
        );

        if (patientIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found in room'
            });
        }

        // Only allow updating specific patient fields
        const allowedFields = ['name', 'age', 'gender', 'diagnosis', 'status', 'contactInfo'];
        const filteredData = {};
        
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        });

        // Update patient data with filtered fields only
        Object.assign(room.patients[patientIndex], filteredData);
        await room.save();
        
        // Remove __v from response
        const roomResponse = room.toObject();
        delete roomResponse.__v;

        res.json({
            success: true,
            message: 'Patient updated successfully',
            data: roomResponse
        });
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating patient',
            error: error.message
        });
    }
};

// Get room statistics
const getRoomStatistics = async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ status: 'available' });
        const fullRooms = await Room.countDocuments({ status: 'full' });
        const maintenanceRooms = await Room.countDocuments({ status: 'maintenance' });
        
        const totalCapacity = await Room.aggregate([
            { $group: { _id: null, total: { $sum: '$capacity' } } }
        ]);
        
        const totalOccupied = await Room.aggregate([
            { $group: { _id: null, total: { $sum: '$occupied' } } }
        ]);

        const occupancyRate = totalCapacity.length > 0 && totalOccupied.length > 0 
            ? ((totalOccupied[0].total / totalCapacity[0].total) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                totalRooms,
                availableRooms,
                fullRooms,
                maintenanceRooms,
                totalCapacity: totalCapacity.length > 0 ? totalCapacity[0].total : 0,
                totalOccupied: totalOccupied.length > 0 ? totalOccupied[0].total : 0,
                occupancyRate: parseFloat(occupancyRate)
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

module.exports = {
    getRooms,
    getRoomByNumber,
    createRoom,
    updateRoom,
    deleteRoom,
    addPatientToRoom,
    removePatientFromRoom,
    updatePatientInRoom,
    getRoomStatistics
};