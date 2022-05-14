const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user.model');
const { successHandle, errorHandle, generateSendJWT } = require('../service');
const { appError } = require('../exceptions');
const { filterParams } = require('../helper/utils');

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
  // console.log(password, user.password);
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
// user, update password
exports.updatePassword = async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(appError('400', '密碼不一致！', next));
  }
  // 密碼 8 碼以上，16 碼以下，英大小寫+數+8碼+ exclued 特殊符號
  let reg = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/, 'g');
  if (password.match(reg) === null) {
    return next(appError('400', '請確認密碼格式符合格式', next));
  }

  // check new password is same as old password
  newPassword = await bcrypt.hash(password, 12);
  const currentUser = await User.findById(req.user.id).select('+password');
  const equal = await bcrypt.compare(password, currentUser.password);
  console.log(equal);
  if (equal) {
    return next(appError('400', '請輸入新密碼', next));
  }

  const user = await User.findByIdAndUpdate(req.user.id, {
    password: newPassword,
  });
  generateSendJWT(user, 200, res);
};
// user, update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const dataTypes = ['string'];
    const genderTypes = ['female', 'male', 'notAccess'];
    const { id } = req.params;
    const data = { userName = null, avatar = null, gender = null } = req.body;
    const filterObj = filterParams(data);

    // no data
    if (Object.keys(filterObj).length <= 0) {
      return next(appError('400', '沒有傳送任何參數資料，無法更新', next));
    }

    for (const key in filterObj) {
      // check type
      if (!dataTypes.includes(typeof filterObj[key])) {
        return next(appError('400', `${key} 資料格式錯誤，目前為：${typeof filterObj[key]}，請為字串`, next));
      }

      // check enum
      if (key === 'gender' && !genderTypes.includes(filterObj[key])) {
        return next(appError('400', `性別資料格式錯誤，目前為：${filterObj[key]}，請為：'female', 'male', 'notAccess'`, next))
      }
    }

    const newUserInfo = await User.findByIdAndUpdate({_id: id}, filterObj);

    successHandle(res, 'success', newUserInfo);
  } catch (error) {
    errorHandle(res, error);
  }
};