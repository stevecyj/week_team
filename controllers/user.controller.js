const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user.model');
const { successHandle, errorHandle, generateSendJWT } = require('../service');
const { appError } = require('../exceptions');
const { filterParams } = require('../helper/utils');

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
  console.log('here')
  generateSendJWT(newUser, 201, res);
};
// user, sing in
exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    appError('400', '帳號密碼不可為空', next);
  }
  const user = await User.findOne({ email }).select('+password');
  // console.log(password, user.password);
  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    appError('400', '您的密碼不正確', next);
  }
  generateSendJWT(user, 200, res);
};
// user, get profile
exports.getProfile = async (req, res, next) => {
  const userId = req.user.id
  
  const userInfo = await User.findById(userId).exec();
  if(!userInfo){
    appError('401','此ID無使用者資訊',next);
  }
  successHandle(res,userInfo)
};
// user, update password
exports.updatePassword = async (req, res, next) => {    
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    appError('400', '密碼不一致！', next)
  }
  // 密碼 8 碼以上，16 碼以下，英大小寫+數+8碼+ exclued 特殊符號
  let reg = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,16}$/, 'g');
  if (password.match(reg) === null) {
    appError('400', '請確認密碼格式符合格式', next)
  }

  // check new password is same as old password
  newPassword = await bcrypt.hash(password, 12);
  const currentUser = await User.findById(req.user.id).select('+password');
  const equal = await bcrypt.compare(password, currentUser.password);
  console.log(equal);
  if (equal) {
    appError('400', '請輸入新密碼', next)
  }

  const user = await User.findByIdAndUpdate(req.user.id, {
    password: newPassword,
  });
  generateSendJWT(user, 200, res);
}

// user, update profile
exports.updateProfile = async (req, res, next) => {
  const dataTypes = ['string'];
  const genderTypes = ['female', 'male', 'notAccess'];
  const data = { userName = null, avatar = null, gender = null } = req.body;
  const filterObj = filterParams(data);

  // no data
  if (Object.keys(filterObj).length <= 0) {
    appError('400', '沒有傳送任何參數資料，無法更新', next)
  }

  for (const key in filterObj) {
    // check type
    if (!dataTypes.includes(typeof filterObj[key])) {
      appError('400', `${key} 資料格式錯誤，目前為：${typeof filterObj[key]}，請為字串`, next);
    }

    // check enum
    if (key === 'gender' && !genderTypes.includes(filterObj[key])) {
      appError('400', `性別資料格式錯誤，目前為：${filterObj[key]}，請為：'female', 'male', 'notAccess'`, next);
    }
  }

  const newUserInfo = await User.updateOne({_id: req.user.id}, filterObj);

  successHandle(res, 'success', newUserInfo);
}

//列出使用者所有追蹤的人
exports.getUserFollowers = async (req, res, next) => {
  const {body}= req;
  const id = {"_id":body.userId}
  const follower = await User.find(id).populate({
    path: "follow.id",
    select: 'userName avatar'
  })
  successHandle(res,follower)
}

//追蹤功能
exports.follow = async (req, res, next) => {
  const {body}= req;
  const id = body.userId //使用者本人
  const followId = body.followId //欲追蹤的人
  if(id===followId){
    appError('400','您無法對自己做追蹤功能',next)
  }
  const check = await User.find({$and: [
    { _id: id },
    { "follow.id": followId },
  ]})
  if(check.length>0){
    await User.findByIdAndUpdate(id,{
      $pull:{ follow:{id:followId} }
    })
    await User.findByIdAndUpdate(followId,{
      $pull:{ beFollowed:{id:id} }
    })
    const followName = await User.findById(followId)
    successHandle(res,{
      status: "退追蹤成功",
      fans: followName.beFollowed.length,
      unfollow: followName
    })
  }else{
    await User.findByIdAndUpdate(id,{
      $push:{ follow:{id:followId} }
    })
    await User.findByIdAndUpdate(followId,{
      $push:{ beFollowed:{id:id} }
    })
    const followName = await User.findById(followId)
    successHandle(res,{
      status: "追蹤成功",
      fans: followName.beFollowed.length,
      follow: followName
    })
  }
}