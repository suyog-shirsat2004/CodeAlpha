const express = require('express');
const router = express.Router();
const { createRoom, getRooms, getRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:code', protect, getRoom);
router.put('/:code', protect, updateRoom);
router.delete('/:code', protect, deleteRoom);

module.exports = router;
