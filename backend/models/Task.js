const mongoose = require('mongoose');

// 定义任务的数据模型
const taskSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // 关联到User模型
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
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);