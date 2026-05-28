const Room = require('../models/Room');
const User = require('../models/User');

exports.createRoom = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Room code is required' });
    }
    const existing = Room.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Room with this code already exists' });
    }
    const room = Room.create({
      name: name || code.toUpperCase(),
      code: code.toUpperCase(),
      host: req.user._id,
      participants: [req.user._id],
    });
    const hostUser = User.findById(req.user._id);
    res.status(201).json({ ...room, hostUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = Room.findAll();
    const userRooms = rooms.filter(r => r.host === req.user._id || r.participants.includes(req.user._id));
    res.json(userRooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const room = Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const hostUser = User.findById(room.host);
    res.json({ ...room, hostUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.host !== req.user._id) {
      return res.status(403).json({ message: 'Only the host can update the room' });
    }
    const updated = Room.update(room._id, { name: req.body.name });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = Room.findOne({ code: req.params.code.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.host !== req.user._id) {
      return res.status(403).json({ message: 'Only the host can delete the room' });
    }
    require('../config/db').remove('rooms', room._id);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
