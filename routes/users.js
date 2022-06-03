const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user.controller');
const { isAuth, handleErrorAsync } = require('../middleware');

router.post('/sign_up', handleErrorAsync(async (req, res, next) => {
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
  usersController.signUp(req, res, next);
})); // 使用者註冊
router.post('/sign_in', handleErrorAsync(async (req, res, next) => {
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
  usersController.signIn(req, res, next);
})); // 使用者登入
router.get('/profile/:id', isAuth, handleErrorAsync(async (req, res, next) => {
  /*
    #swagger.tags = ['Users - 使用者']
    #swagger.description = '取得單一使用者資料 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: '使用ID 測試用ID 628897f1c31436e77ba6a8c1',
      required: true,
    }
    #swagger.responses[200] = {
      description: '',
      schema: {
        "status": true,
        "data": {
          "_id": "628897f1c31436e77ba6a8c1",
          "userName": "Jolyne",
          "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
          "gender": "female",
          "likeList": [],
          "follow": [
            {
              "id": "62811968820c4588fef6e57a",
              "_id": "6288ab20d536ebfaec2c5a1b",
              "datetime_update": "2022-05-21T09:04:32.992Z"
            }
          ],
          "beFollowed": [],
          "createAt": "2022-05-21T07:42:41.221Z",
          "updateAt": "2022-05-21T07:42:41.221Z"
        }
      }
    }
  */
  usersController.getProfile(req, res, next);
})); // 使用者資料
router.post('/password', isAuth, handleErrorAsync(async (req, res, next) => {
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
  usersController.updatePassword(req, res, next);
})); // 修改密碼
router.patch('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
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
  usersController.updateProfile(req, res, next);
}));

router.get('/followers', isAuth, handleErrorAsync(async (req, res, next) => {
  /*
    #swagger.tags = ['Users - 使用者']
    #swagger.description = '取得使用者自身的所有追蹤 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.responses[200] = {
      description: '追蹤清單請見id欄位而非_id',
      schema: {
        "status": true,
        "data": [
          {
            "_id": "628b935becef6eec03a0ecc7",
            "userName": "皮皮",
            "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
            "gender": "notAccess",
            "likeList": [],
            "follow": [
              {
                  "id": {
                      "_id": "627f4c9733358fcd5c994093",
                      "userName": "心凌姊姊",
                      "avatar": "https://randomuser.me/api/portraits/lego/3.jpg"
                  },
                  "_id": "629783d281d20b4d9a63119d",
                  "datetime_update": "2022-06-01T15:20:50.232Z"
              }
            ],
            "beFollowed": [],
            "createAt": "2022-05-23T13:59:55.889Z",
            "updateAt": "2022-05-23T13:59:55.889Z"
          }
        ]
      }
    }
  */
  usersController.getUserFollowers(req, res, next);
}));
router.post('/follow', isAuth, handleErrorAsync(async (req, res, next) => {
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
        "data": {
          "status": "追蹤成功",
          "fans": 1,
          "follow": {
            "_id": "627f4c9733358fcd5c994093",
            "userName": "心凌姊姊",
            "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
            "gender": "notAccess",
            "follow": [],
            "beFollowed": [],
            "likeList": [],
            "createAt": "2022-05-14T06:30:47.303Z",
            "updateAt": "2022-05-14T06:30:47.303Z"
          }
        }
      }
    }
  */
  usersController.follow(req, res, next);
}));

module.exports = router;
