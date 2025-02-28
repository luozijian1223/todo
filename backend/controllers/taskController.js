const Task = require('../models/Task');

// 获取所有任务
exports.getTasks = async (req, res) => {
  try {
    // 从查询参数中获取用户名，默认为当前用户
    const user = req.query.user || 'luozijian1223';
    
    const tasks = await Task.find({ user }).sort({ createdAt: -1 });
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
    
    const task = await Task.create({
      user: req.body.user || 'luozijian1223',
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
    
    // 更新任务
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // 返回更新后的文档
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
    
    await task.remove();
    
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};