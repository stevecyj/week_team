var express = require('express');
var router = express.Router();
const postsController = require('../controllers/post.controller');
const { isAuth, handleErrorAsync } = require('../middleware');

// create and save a new post
router.post(
  '/post',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /* 
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '新增貼文 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: '',
      required: true,
      schema: {
        $userId: '62749b880b0c853f222d8696',
        $tags: '[test]',
        $type: 'person',
        $content: '測試發文',
        image: 'https://i.picsum.photos/id/817/200/300.jpg?hmac=Egrlh6ZzXMOSu9esbUDMY8PhK3cBCmeqHyWBXm7dnHQ',
      }
    }
    #swagger.responses[200] = {
      description: '',
      schema: {
        status: 'success',
        message: 'success',
        data: {
            postId: '62886e5e526a5458bac3efd6'
        }
      }
    }
  */
    postsController.create(req, res, next);
  })
);

// search posts by keyword
router.post(
  '/search',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '搜尋貼文 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'keyword: 搜尋關鍵字，空值為全部搜尋,\n sortby: datetime_pub最新貼文時間排序 datetime_pub_asc舊到新排序,\n  limit: 每頁幾筆,\n page: 第幾頁開始,\n userId: 填入登入使用者，會搜尋使用者與使用者追蹤者貼文,\n authorId: 搜尋特定使用者所有發文，此欄如有填，則userId欄位無作用\n 不填keyword, userId, authorId可以搜尋全部文章/n userId和authorId二選一填，userId用在個人動態牆，authorId用在特定使用者所有發文',
      schema: {
        keyword: "", 
        sortby: "datetime_pub",
        limit: 10,
        page: 1,
        userId: "62741e710b0c853f222d8691",
        authorId: "62749ba20b0c853f222d8697"
      }
    }
    #swagger.responses[200] = {
      description: '',
      schema: {
        "status": "success",
        "payload": {
          "count": 3,
          "limit": 10,
          "page": 1,
          "posts": [
            {
              "user": {
                "_id": "62749ba20b0c853f222d8697",
                "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
                "userName": "DDD"
              },
              "postId": "627bd58d4b9b3a393e5eb884",
              "content": "測試發文",
              "image": "https://i.picsum.photos/id/817/200/300.jpg?hmac=Egrlh6ZzXMOSu9esbUDMY8PhK3cBCmeqHyWBXm7dnHQ",
              "datetime_pub": "2022-05-11T15:26:05.393Z",
              "commets": [
                {
                  "_id": "629610fb7e35a043b9cb87bf",
                  "comment": "測試留言",
                  "user": {
                    "_id": "628897f1c31436e77ba6a8c1",
                    "userName": "Jolyne"
                  },
                  "post": "627bd58d4b9b3a393e5eb884"
                }
              ]
            }
          ]
        }
      }
    }
  */
    postsController.search(req, res, next);
  })
);

router.get(
  '/likedPosts',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '搜尋貼文 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['p'] = {
      in: 'query',
      description: 'p頁數(default: 1)',
    }
    #swagger.parameters['s'] = {
      in: 'query',
      description: 's每頁幾筆(default: 10)',
    }
    #swagger.responses[200] = {
      description: '',
      schema: {
        "status": "success",
        "message": "success",
        "data": [
          {
            "_id": "6295cab2a2c8482ee670f374",
            "user": {
                "_id": "628897f1c31436e77ba6a8c1",
                "userName": "Jolyne",
                "avatar": "https://randomuser.me/api/portraits/lego/3.jpg"
            },
            "tags": [
                "test"
            ],
            "type": "person",
            "image": "",
            "content": "再是一次，花惹發",
            "likes": [
                "628930fbc6f889e77a6b3e55"
            ],
            "createAt": "2022-05-31T07:58:42.126Z",
            "comments": [],
            "id": "6295cab2a2c8482ee670f374"
          }
        ]
      }
    }
  */
    postsController.getLikedPosts(req, res, next);
  })
);

// add Comment by post id
router.post(
  '/comment/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '留言 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: '文章ID 測試用ID 6288960ac2049c4b43b9e5d3',
      required: true,
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: '',
      required: true,
      schema: {
        $comment: "測試留言",
      }
    }
    #swagger.responses[200] = {
      description: '被留言之文章原始資料',
      schema: {
        "status": "success",
        "message": "success",
        "data": {
          "comments": {
            "comment": "測試留言",
            "user": {
              "_id": "628897f1c31436e77ba6a8c1",
              "userName": "Jolyne",
              "avatar": "https://randomuser.me/api/portraits/lego/3.jpg"
            },
            "post": "6288960ac2049c4b43b9e5d3",
            "_id": "629ade349a98662867513293",
            "createdAt": "2022-06-04T04:23:16.548Z"
          }
        }
      }
    }
  */
    postsController.addComment(req, res, next);
  })
);

// delete Comment by post id
router.delete(
  '/comment/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '刪除留言 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: '文章ID 測試用ID 62960ea87415f9b526ba6c7c',
      required: true,
    }
    #swagger.responses[200] = {
      description: '被留言之文章原始資料',
      schema: {
        "status": "success",
        "message": "success",
        "data": "已刪除此留言"
      }
    }
  */
    postsController.delComment(req, res, next);
  })
);

// update Comment by post id
router.patch(
  '/comment/:id',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '更新留言 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: '文章ID 測試用ID 62960ed57415f9b526ba6c80',
      required: true,
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: '',
      required: true,
      schema: {
        $comment: "編輯留言",
      }
    }
    #swagger.responses[200] = {
      description: '被留言之文章原始資料',
      schema: {
        "status": "success",
        "message": "success",
        "data": {
          "_id": "62960ed57415f9b526ba6c80",
          "comment": "留言",
          "user": {
            "_id": "628897f1c31436e77ba6a8c1",
            "userName": "Jolyne"
          },
          "post": "6288960ac2049c4b43b9e5d3",
          "createdAt": "2022-05-31T12:49:25.687Z"
        }
      }
    }
  */
    postsController.updateComment(req, res, next);
  })
);

// update a like by post id and user id
router.patch(
  '/like',
  isAuth,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '按讚/取消讚 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: '',
      required: true,
      schema: {
        $postId: "6288960ac2049c4b43b9e5d3", 
        $userId: "62749ba20b0c853f222d8697",  
      }
    }
    #swagger.responses[200] = {
      description: '按讚者ID與被按讚文章ID',
      schema: {
        "status": "success",
        "message": "success",
        "data": {
          "userId": "62749ba20b0c853f222d8697",
          "postId": "6288960ac2049c4b43b9e5d3"
        }
      }
    }
  */
    postsController.updateLike(req, res, next);
  })
);

module.exports = router;
