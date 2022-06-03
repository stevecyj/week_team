const uncaughtException = (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error('Uncaughted Exception！');
  console.error(`err name: ${err.name}`);
  console.error(`err message: ${err.message}`);
  console.error(`err stack: ${err.stack}`);
  process.exit(1);
};

const unhandledRejection = (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason);
  // 記錄於 log 上
};

const appError = (httpStatus, errMessage, next) => {
  const error = new Error(errMessage);
  error.statusCode = httpStatus;
  error.isOperational = true;
  next(error);
};

// express dev 錯誤處理
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// express production 錯誤處理(custom)
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'fail',
      message: '系統錯誤，請恰系統管理員',
    });
  }
};

// 錯誤處理, error handler, final
const errorResponder = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  // dev
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  // production
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未填寫正確，請重新輸入！';
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
};

const error404 = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '無此路由資訊',
  });
};

module.exports = {
  uncaughtException,
  unhandledRejection,
  appError,
  errorResponder,
  error404,
};
