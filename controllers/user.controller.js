const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user.model');
const { successHandle, errorHandle, generateSendJWT } = require('../service');
const { appError } = require('../exceptions');

exports.getUsers = async (req, res) => {
  const allUsers = await User.find();
  successHandle(res, allUsers);
};
exports.createUser = async (req, res) => {
  try {
    const { body } = req;
    if (body.email && body.userName && body.password) {
      const newUser = await User.create({
        email: body.email,
        userName: body.userName,
        password: body.password,
        avatar: body.avatar,
        gender: body.gender,
        follow: body.follow,
        beFollowed: body.beFollowed,
        likeList: body.likeList,
      });
      successHandle(res, newUser);
    } else {
      errorHandle(res);
    }
  } catch (err) {
    errorHandle(res, err);
  }
};
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const updateUser = await User.findById(id);
    if (updateUser && body.password) {
      const result = await User.findByIdAndUpdate(id, body);
      result ? successHandle(res, updateUser) : errorHandle(res);
    } else {
      errorHandle(res);
    }
  } catch (err) {
    errorHandle(res, err);
  }
};
// user, register
exports.signUp = async (req, res, next) => {
  let { email, password, confirmPassword, userName } = req.body;
  // 內容不可為空
  if (!email || !password || !confirmPassword || !userName) {
    return next(appError('400', '欄位未填寫正確！', next));
  }
  // 密碼正確
  if (password !== confirmPassword) {
    return next(appError('400', '密碼不一致！', next));
  }
  // 密碼 8 碼以上，16 碼以下，英大小寫+數+8碼+ exclued 特殊符號
  let reg = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/, 'g');
  if (password.match(reg) === null) {
    return next(appError('400', '請確認密碼格式符合格式', next));
  }
  // 暱稱 2 個字以上
  if (!validator.isLength(userName, { min: 2 })) {
    return next(appError('400', '暱稱字數低於 2 碼', next));
  }
  // 是否為 Email
  if (!validator.isEmail(email)) {
    return next(appError('400', 'Email 格式不正確', next));
  }

  // 加密密碼
  password = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    email,
    password,
    userName,
  });
  generateSendJWT(newUser, 201, res);
};
// user, sing in
exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(appError(400, '帳號密碼不可為空', next));
  }
  const user = await User.findOne({ email }).select('+password');
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    return next(appError(400, '您的密碼不正確', next));
  }
  generateSendJWT(user, 200, res);
};
// user, get profile
exports.getProfile = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
};
