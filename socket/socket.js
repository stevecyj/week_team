const jwt = require('jsonwebtoken');
const { handleErrorAsync } = require('../middleware');
const { appError } = require("../exceptions");
const User = require('../models/user.model');

/** 目標通知數量 */
const TARGET_NOTIFICATION_COUNT = 5;
/** 初始化通知數量 */
const INIT_NOTIFICATION_COUNT = 0;

/** 在線使用者，資料結構 ex：[{ userId: '1', socketIds: ['1'], synCount: 0 }] */
let onlineUsers = [];

/** 新增在線使用者
 * @param {*} userId userId
 * @param {*} socketId  socketId
 */
const addNewUser = (userId, socketId) => {
  if (onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.forEach(user => {
      user.userId === userId && !user.socketIds.includes(socketId) && user.socketIds.push(socketId);
    });
  } else {
    onlineUsers.push({ userId, socketIds: [socketId], synCount: INIT_NOTIFICATION_COUNT });
  }
};

/** 移除在線使用者
 * @param {*} userId userId
 * @param {*} socketId socketId
 */
const removeUser = (userId, socketId) => {
  // 更新陣列內 user socketIds 資料
  onlineUsers.forEach((user) => {
    user.userId === userId && (user.socketIds = user.socketIds.filter((id) => id !== socketId))
  });

  // 移除 user socketIds 等於 0 的
  onlineUsers = onlineUsers.filter((user) => user.socketIds.length > 0);
};

/** 取得使用者
 * @param {*} userId userId
 * @returns {Object} 在線使用者資訊
 */
const getUsers = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

/** 更新在線使用者訊息數量
 * @param {*} socketId socketId
 */
const updateUserNotificationCount = (sender) => {
  onlineUsers.forEach((user) => {
    user.userId !== sender.userId && user.synCount++
  });
};

/** 發送通知給達到特定數量通知的使用者
 * @param {*} io socket id 實體
 */
const sendNotification = (io) => {
  onlineUsers.forEach((user) => {
    // 判斷 user 是否有達到送通知條件
    if (user.synCount === TARGET_NOTIFICATION_COUNT) {
      // 發送通知可以要資料
      user.socketIds.forEach((socketId) => io.to(socketId).emit('syncNotification'));

      // 送達通知後使用者通知初始化
      user.synCount = INIT_NOTIFICATION_COUNT;
    }
  });
};

// web socket 連線邏輯
const connectSocket = handleErrorAsync(async (io) => {
  io.use(async (socket, next) => {
    // 檢查 token 格式
    if (!socket.handshake.headers?.authorization && !socket.handshake.headers.authorization.startsWith('Bearer')) {
      return next(appError(401, '你尚未登入！', next));
    }

    const token = socket.handshake.headers.authorization.split(' ')[1];

    // 檢查 token 資料
    if (!token) {
      return next(appError(401, '你尚未登入！', next));
    }

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

    // 檢查 decoded 解析
    if (!decoded || !decoded?.id) {
      return next(appError(401, '你尚未登入！', next));
    }

    // 用 decoded完資料內 ID 找使用者資料
    const currentUser = await User.findById(decoded.id);

    // 檢查使用者
    if (!currentUser) {
      return next(appError(400, '無使用者！', next));
    }

    // socket 實體加上 user 資訊
    socket.user = currentUser;

    // socket 實體加上 user 資訊，往下傳
    next();
  })
  .on('connection', (socket) => {
    // 註冊使用者
    socket.on('newUser', () => {
      addNewUser(socket.user.id, socket.id);
    });

    // // 發送更新通知
    socket.on('updatePost', () => {
      // 發送通知者
      const sender = getUsers(socket.user.id);

      // 更新通知數量
      updateUserNotificationCount(sender);

      // 發送通知
      sendNotification(io);
    });

    // 移除使用者
    socket.on('disconnect', () => {
      removeUser(socket.user.id, socket.id);
    });
  });
});


module.exports = connectSocket;