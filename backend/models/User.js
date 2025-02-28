const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '请输入用户名'],
      unique: true
    },
    email: {
      type: String,
      required: [true, '请输入邮箱'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        '请输入有效的邮箱地址'
      ]
    },
    password: {
      type: String,
      required: [true, '请输入密码'],
      minlength: [6, '密码至少需要6个字符']
    }
  },
  {
    timestamps: true
  }
);

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  // 生成盐并加密密码
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 验证密码的方法
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);