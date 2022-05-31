const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/user.model');
const { successHandle, errorHandle, generateSendJWT } = require('../service');
const { appError } = require('../exceptions');
const { filterParams } = require('../helper/utils');
const { handleErrorAsync } = require('../middleware');

// --- 未用到API (後續待刪)--- start
exports.getUsers = async (req, res) => {
  /*
    #swagger.tags = ['Users - 使用者']
    #swagger.description = '取得所有使用者 API'
    #swagger.ignore = true
  */
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
  /*
    #swagger.tags = ['Users - 使用者']
    #swagger.description = '重設使用者密碼 API'
    #swagger.ignore = true
  */
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
// --- 未用到API --- end

// user, register
exports.signUp = (req, res, next) => { 
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '註冊使用者 API'
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $userName: 'JOJO',
          $email: 'test789@gmail.com',
          $confirmPassword: 'Qwer1234',
          $password: 'Qwer1234'
        }
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": "success",
          "user": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyODg5YWE5N2Y1MDFlM2Y5NTE4YzYxZSIsImlhdCI6MTY1MzExOTY1NywiZXhwIjoxNjUzNzI0NDU3fQ.T4awTz-A_xEZMromfdFgfTgb5lNU2oLGPGu9cqMCHes",
            "name": "JOJO"
          }
        }
      }
    */
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
  })(req, res, next)
};
// user, sing in
exports.signIn = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '登入 API'
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $email: 'test789@gmail.com',
          $password: 'Qwer1234'
        }
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": "success",
          "user": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyODg5YWE5N2Y1MDFlM2Y5NTE4YzYxZSIsImlhdCI6MTY1MzExOTY1NywiZXhwIjoxNjUzNzI0NDU3fQ.T4awTz-A_xEZMromfdFgfTgb5lNU2oLGPGu9cqMCHes",
            "name": "JOJO"
          }
        }
      }
    */
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
  })(req, res, next)
};
// user, get profile
exports.getProfile = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '取得單一使用者資料 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['id'] = {
        in: 'path',
        description: '使用者ID，測試用ID 628897f1c31436e77ba6a8c1',
        required: true,
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": true,
          "data": [
            {
              "_id": "628897f1c31436e77ba6a8c1",
              "userName": "JOJO",
              "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
              "gender": "notAccess",
              "likeList": [],
              "follow": [],
              "beFollowed": [],
              "createAt": "2022-05-21T07:42:41.221Z",
              "updateAt": "2022-05-21T07:42:41.221Z"
            }
          ]
        }
      }
    */
    const userId = req.user.id
    
    const userInfo = await User.findById(userId).exec()
    if(!userInfo){
      appError('401','此ID無使用者資訊',next)
    }
      successHandle(res,userInfo)
  })(req, res, next)
};
// user, update password
exports.updatePassword = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '重設使用者密碼 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $password: 'Qwer1235',
          $confirmPassword: 'Qwer1235'
        }
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": "success",
          "user": {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyODg5N2YxYzMxNDM2ZTc3YmE2YThjMSIsImlhdCI6MTY1MzEyMjEyNCwiZXhwIjoxNjUzNzI2OTI0fQ.Dj3KfnQqdIkIdkdxyijP6C3KmzdQ8cSQPQLPEomPKl0",
            "name": "JOJO"
          }
        }
      }
    */
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
  })(req, res, next)
}

// user, update profile
exports.updateProfile = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '編輯個人資料 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'gender options: [male, female, notAccess]',
        required: true,
        schema: {
          $userName: 'Jolyne',
          $avatar: 'https://randomuser.me/api/portraits/lego/3.jpg',
          $gender: 'female'
        }
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": true,
          "data": "success"
        }
      }
    */
    const dataTypes = ['string'];
    const genderTypes = ['female', 'male', 'notAccess'];
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
  
    const newUserInfo = await User.updateOne({_id: req.user.id}, filterObj);
  
    successHandle(res, 'success', newUserInfo);
  })(req, res, next)
}

//列出使用者所有追蹤的人
exports.getUserFollowers = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '取得使用者自身的所有追蹤 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $userId: '628897f1c31436e77ba6a8c1',
        }
      }
      #swagger.responses[200] = {
        description: '追蹤清單請見id欄位而非_id',
        schema: {
          "status": true,
          "data": [
            {
              "id": "62811968820c4588fef6e57a",
              "_id": "6288ab20d536ebfaec2c5a1b",
              "datetime_update": "2022-05-21T09:04:32.992Z"
            }
          ]
        }
      }
    */
    const {body}= req;
    const id = body.userId
    const followrs = await User.findById(id)
    console.log(followrs)
    successHandle(res,followrs.follow)
  })(req, res, next)
}

//追蹤功能
exports.follow = (req, res, next) => {
  handleErrorAsync(async(req, res, next) => {
    /*
      #swagger.tags = ['Users - 使用者']
      #swagger.description = '追蹤/取消追蹤 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $userId: '628897f1c31436e77ba6a8c1',
          $followId: '62811968820c4588fef6e57a'
        }
      }
      #swagger.responses[200] = {
        description: '',
        schema: {
          "status": true,
          "data":  {
            "status": "追蹤成功",
            "follow": "62811968820c4588fef6e57a",
            "fans": 1
          }
        }
      }
    */
    const {body}= req;
    const id = body.userId //使用者本人
    const followId = body.followId //欲追蹤的人
    const followrs = await User.findById(id)
    const check = followrs.follow.find(item=>{
      return item.id === followId;
    })
    if(check === undefined){
      await User.findByIdAndUpdate(id,{
        $push:{ follow:{id:followId} }
      })
      await User.findByIdAndUpdate(followId,{
        $push:{ beFollowed:{id:id} }
      })
      const user = await User.findById(followId)
      const beFollowers = user.beFollowed.length
      successHandle(res,{
        status: "追蹤成功",
        follow: followId,
        fans: beFollowers
      })
    }else{
      await User.findByIdAndUpdate(id,{
        $pull:{ follow:{id:followId} }
      })
      await User.findByIdAndUpdate(followId,{
        $pull:{ beFollowed:{id:id} }
      })
      const user = await User.findById(followId)
      const beFollowers = user.beFollowed.length
      successHandle(res,{
        status: "退追蹤成功",
        unfollow: followId,
        fans: beFollowers
      })
    }
  })(req, res, next)
}