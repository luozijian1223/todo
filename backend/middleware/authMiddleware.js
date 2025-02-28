const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 保护路由的中间件
const protect = async (req, res, next) => {
  let token;

  // 从请求头或cookie中获取token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 从Bearer token中提取token
      token = req.headers.authorization.split(' ')[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 获取用户信息，排除密码
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '未授权，token失效' });
    }
  } else if (req.cookies.token) {
    // 尝试从cookies获取token
    try {
      token = req.cookies.token;
      
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 获取用户信息，排除密码
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: '未授权，token失效' });
    }
  }

  if (!token) {
    res.status(401).json({ message: '未授权，没有token' });
  }
};

module.exports = { protect };