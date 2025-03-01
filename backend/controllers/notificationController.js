const Task = require('../models/Task');
const nodemailer = require('nodemailer');

// 配置邮件发送器（仅示例，需要您自己的邮箱配置）
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 检查即将到期的任务并发送提醒
exports.checkDueTasks = async () => {
  try {
    const now = new Date();
    // 查找24小时内到期但尚未完成的任务
    const dueTasks = await Task.find({
      dueDate: {
        $gt: now,
        $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      },
      completed: false
    });

    // 按用户分组任务
    const tasksByUser = dueTasks.reduce((acc, task) => {
      if (!acc[task.user]) {
        acc[task.user] = [];
      }
      acc[task.user].push(task);
      return acc;
    }, {});

    // 为每个用户发送提醒邮件
    Object.entries(tasksByUser).forEach(([user, tasks]) => {
      // 这里应该从用户表中获取用户的邮箱，但为了简单起见，我们使用一个固定邮箱
      const userEmail = `${user}@example.com`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: '待办事项提醒',
        html: `
          <h2>您有 ${tasks.length} 个任务即将到期</h2>
          <ul>
            ${tasks.map(task => `
              <li>
                <strong>${task.title}</strong><br>
                描述: ${task.description || '无'}<br>
                截止时间: ${new Date(task.dueDate).toLocaleString()}
              </li>
            `).join('')}
          </ul>
          <p>请尽快完成这些任务！</p>
        `
      };

      // 发送邮件
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('发送提醒邮件失败:', error);
        } else {
          console.log('提醒邮件已发送:', info.response);
        }
      });
    });

  } catch (error) {
    console.error('检查到期任务失败:', error);
  }
};