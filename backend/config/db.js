const mongoose = require('mongoose');

// 连接到 MongoDB 数据库
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error(`数据库连接错误: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;