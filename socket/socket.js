/** 目標通知數量 */
const TARGET_NOTIFICATION_COUNT = 5;
/** 初始化通知數量 */
const INIT_NOTIFICATION_COUNT = 0;

/** 在線使用者，資料結構 ex：[{ userId, socketId, synCount }] */
let onlineUsers = [];

/** 新增在線使用者
 * @param {*} userId userId
 * @param {*} socketId  socketId
 */
const addNewUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&  onlineUsers.push({ userId, socketId, synCount: INIT_NOTIFICATION_COUNT });
};

/** 移除在線使用者
 * @param {*} socketId socketId 
 */
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

/** 取得使用者
 * @param {*} userId userId
 * @returns {Object} 在線使用者資訊
 */
const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

/** 更新在線使用者訊息數量
 * @param {*} socketId socketId
 */
const updateUserNotificationCount = (socketId) => {
  onlineUsers.forEach((user) => {
    user.socketId !== socketId && user.synCount++;
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
      io.to(user.socketId).emit('syncNotification');

      // 送達通知後使用者通知初始化
      user.synCount = INIT_NOTIFICATION_COUNT;
    }
  });
};

// web socket 連線邏輯
const connectSocket = async (io) => {
  io.on('connection', (socket) => {
    // 註冊使用者
    socket.on('newUser', (userId) => {
      addNewUser(userId, socket.id);
    });

    // // 發送更新通知
    socket.on('updatePost', (userId) => {
      // 發送通知者
      const sender = getUser(userId);

      // 更新通知數量
      updateUserNotificationCount(sender.socketId);

      // 發送通知
      sendNotification(io);
    });

    // 移除使用者
    socket.on('disconnect', () => {
      removeUser(socket.id);
    });
  });
};


module.exports = connectSocket;