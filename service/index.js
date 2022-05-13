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
// express 錯誤處理
// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    // log 紀錄
    console.error("出現重大錯誤", err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: "error",
      message: "系統錯誤，請恰系統管理員",
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

module.exports = {
  errorHandle,
  successHandle,
  generateSendJWT,
  resErrorProd,
  resErrorDev,
};
