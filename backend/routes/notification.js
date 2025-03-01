const express = require('express');
const router = express.Router();
const { checkDueTasks } = require('../controllers/notificationController');

// 手动触发检查到期任务的路由（用于测试）
router.get('/check-due-tasks', (req, res) => {
  try {
    checkDueTasks();
    res.status(200).json({ message: '检查到期任务已触发' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;