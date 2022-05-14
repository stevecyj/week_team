const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { appError } = require('../exceptions');

// get error from catch
const handleErrorAsync = function handleErrorAsync(func) {
  // func 先將 async fun 帶入參數儲存
  // middleware 先接住 router 資料
  return function (req, res, next) {
    //再執行函式，async 可再用 catch 統一捕捉
    func(req, res, next).catch(function (error) {
      return next(error);
    });
  };
};

// 確認 Auth 狀態
const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appError(401, '你尚未登入！', next));
  }

  // 驗證 token 正確性
  // 獲得 payload 的資訊，取得 user id
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
  // ! check or not check is currentUser exist
  const currentUser = await User.findById(decoded.id);

  // req 加上 user 資訊，傳回路由
  req.user = currentUser;
  next();
});

module.exports = { handleErrorAsync, isAuth };
