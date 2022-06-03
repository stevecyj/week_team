var express = require("express");
var router = express.Router();
const postsController = require("../controllers/post.controller");
const { isAuth, handleErrorAsync } = require('../middleware');

// create and save a new post
router.post("/addPost", isAuth, handleErrorAsync(async (req, res, next)=>{
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
}));

// search posts by keyword
router.post("/search", isAuth, handleErrorAsync(async (req, res, next) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '搜尋貼文 API'
    #swagger.security = [{ apiKeyAuth: [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'keyword: 搜尋關鍵字，空值為全部搜尋,\n sortby: 只提供最新貼文時間排序,\n  limit: 每頁幾筆,\n page: 第幾頁開始,\n userId: 填入登入使用者，會搜尋使用者與使用者追蹤者貼文,\n authorId: 搜尋特定使用者所有發文，此欄如有填，則userId欄位無作用\n 不填keyword, userId, authorId可以搜尋全部文章/n userId和authorId二選一填，userId用在個人動態牆，authorId用在特定使用者所有發文',
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
}));

router.get("/likedPosts", isAuth, handleErrorAsync(async (req, res, next) => {
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
}));

// add Comment by post id
router.post("/comment/:id", isAuth, handleErrorAsync(async (req, res, next) => {
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
            "user": "628897f1c31436e77ba6a8c1",
            "post": "6288960ac2049c4b43b9e5d3",
            "_id": "62960e0bec13021324e61213",
            "createdAt": "2022-05-31T12:46:03.686Z"
          }
        }
      }
    }
  */
  postsController.addComment(req, res, next);
}));

// delete Comment by post id 
router.delete("/comment/:id", isAuth, handleErrorAsync(async (req, res, next) => {
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
}));

// update Comment by post id 
router.patch("/comment/:id", isAuth, handleErrorAsync(async (req, res, next) => {
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
}));

// update a like by post id and user id 
router.patch("/updateLike/", isAuth, handleErrorAsync(async (req, res, next) => {
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
      description: '被留言之文章原始資料',
      schema: {
        "status": "success",
        "message": {
          "user": {
            "gender": "notAccess",
            "_id": "62749ba20b0c853f222d8697",
            "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
            "userName": "DDD",
            "beFollowed": [
              {
                "id": "62741e710b0c853f222d8691",
                "datetime_update": "2022-05-05T19:03:55.552Z"
              }
            ],
            "follow": [
              {
                "id": "62741e710b0c853f222d8691",
                "datetime_update": "2022-05-05T19:03:55.552Z"
              }
            ],
            "likeList": [
              "627bd5634b9b3a393e5eb87c",
              "6288960ac2049c4b43b9e5d3"
            ],
            "createAt": "2022-05-21T09:49:12.543Z",
            "updateAt": "2022-05-21T09:49:12.543Z"
          },
          "post": {
            "_id": "6288960ac2049c4b43b9e5d3",
            "user": "62749b880b0c853f222d8696",
            "tags": [
              "[test]"
            ],
            "type": "person",
            "image": "https://i.picsum.photos/id/817/200/300.jpg?hmac=Egrlh6ZzXMOSu9esbUDMY8PhK3cBCmeqHyWBXm7dnHQ",
            "content": "測試發文",
            "likes": [
              "62749ba20b0c853f222d8697"
            ],
            "createAt": "2022-05-21T07:34:34.522Z",
            "comments": [
              {
                "userName": "DDD",
                "userPhoto": "https://randomuser.me/api/portraits/lego/3.jpg",
                "message": "測試留言",
                "_id": "6288b266ea5a7a1cdc79cd04"
              }
            ]
          }
        },
        "data": []
      }
    }
  */
  postsController.updateLike(req, res, next);
}));

// retrieve all posts from db
// router.get("/getAllPosts", postsController.findAll);

// find a single post by id
// router.get("/getOnePost/:id", postsController.findOne);

// update a post by id
// router.patch("/updatePost/:id", postsController.update);

// test post, get req body
// router.post("/testPost", postsController.testPost);

// delete a post by id
// router.delete("/deletePost/:id", postsController.delete);

// delete all posts
// router.delete("/deleteAllPosts", postsController.deleteAll);

// find all published posts
// router.get("/getAllPublishedPosts", postsController.findAllPublished);

module.exports = router;
