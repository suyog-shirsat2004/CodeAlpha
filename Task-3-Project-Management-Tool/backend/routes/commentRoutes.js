const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');

router.get('/task/:taskId', protect, getComments);
router.post('/task/:taskId', protect, createComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
