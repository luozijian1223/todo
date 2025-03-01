const Task = require('../models/Task');

// 获取所有任务
exports.getTasks = async (req, res) => {
  try {
    // 只获取当前登录用户的任务
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 创建新任务
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title || !dueDate) {
      return res.status(400).json({ message: '请提供任务标题和截止时间' });
    }
    
    // 将当前用户ID关联到任务
    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      completed: false
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个任务
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    // 确认任务属于当前用户
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限访问此任务' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    // 确认任务属于当前用户
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限修改此任务' });
    }
    
    // 更新任务
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }
    
    // 确认任务属于当前用户
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '没有权限删除此任务' });
    }
    
    await Task.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};