const mongoose = require('mongoose');

// 定义任务的数据模型
const taskSchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      default: 'luozijian1223'
    },
    title: {
      type: String,
      required: [true, '请添加任务标题']
    },
    description: {
      type: String
    },
    dueDate: {
      type: Date,
      required: [true, '请设置截止时间']
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // 自动添加 createdAt 和 updatedAt 字段
  }
);

module.exports = mongoose.model('Task', taskSchema);