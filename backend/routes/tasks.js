const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// 获取所有任务和创建新任务
router.route('/')
  .get(getTasks)
  .post(createTask);

// 获取、更新和删除单个任务
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;