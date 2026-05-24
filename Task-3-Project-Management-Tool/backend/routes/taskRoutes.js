const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require('../controllers/taskController');

router.get('/project/:projectId', protect, getTasks);
router.post('/project/:projectId', protect, createTask);
router.put('/reorder', protect, reorderTasks);
router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
