const jwt = require("jsonwebtoken");

const errorHandle = (res, err) => {
  const errMsg = err ? err.message : "欄位未填寫正確，或無此 id";
  res.status(400).send({
    status: false,
    message: errMsg,
  });
  res.end();
};
const successHandle = (res, data) => {
  res.send({
    status: true,
    data,
  });
  res.end();
};
const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};
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
const generateSendJWT = (user, statusCode, res) => {
  // 產生 JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    user: {
      token,
      name: user.name,
    },
  });
};
module.exports = {
  errorHandle,
  successHandle,
  appError,
  handleErrorAsync,
  generateSendJWT,
};
