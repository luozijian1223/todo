const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 生成JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 用户注册
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ 
      $or: [
        { email },
        { username }
      ] 
    });

    if (userExists) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      // 设置cookie
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // 生产环境使用https
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
      });

      // 返回用户信息
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      res.status(400).json({ message: '无效的用户数据' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户登录
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 根据用户名或邮箱查找用户
    const user = await User.findOne({
      $or: [
        { username },
        { email: username } // 允许使用邮箱作为用户名登录
      ]
    });

    // 检查用户是否存在及密码是否正确
    if (user && (await user.matchPassword(password))) {
      // 设置cookie
      const token = generateToken(user._id);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // 返回用户信息
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      res.status(401).json({ message: '用户名或密码不正确' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户登出
exports.logoutUser = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({ message: '用户已登出' });
};

// 获取当前用户信息
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新用户信息
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email
      });
    } else {
      res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};