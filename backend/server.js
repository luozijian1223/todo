const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

const app = express();

// 设置当前时间和用户
app.locals.currentDateTime = new Date('2025-03-01 05:17:38');
app.locals.currentUser = 'luozijian1223';

// 中间件
app.use(cors({
  origin: ['http://localhost:5500', 'http://localhost:3000', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000'],
  credentials: true // 允许跨域携带cookie
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // 解析cookie

// 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API 连接测试成功!', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('API 运行正常!');
});

// 在生产环境中提供静态资源
if (process.env.NODE_ENV === 'production') {
  // 设置静态文件夹
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  // 所有未匹配的路由将返回前端应用
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

// 移除了定时任务和邮件提醒相关代码

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT} 上 - ${new Date().toLocaleString()}`));