const Post = require("../models/post.model"); // model Post
const User = require("../models/user.model");
const { successHandler, errorHandler } =require('../server/handle')
const { appError } = require("../exceptions");
const { handleErrorAsync } = require('../middleware');

// create and save a new post
exports.create = (req, res, next) => {
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
    const { userId, content, image, likes ,tags} = req.body;
    let dataPost = {
      user: userId,
      tags,
      type: req.body.type || "person",
      image,
      content,
      likes,
    };
    if (!dataPost.content) {
      appError('400', '內容不能為空', next);
    } else {
      const newPost = await Post.create(dataPost);
      let payload = { postId: newPost._id };
      successHandler(res, 'success', payload);
    }
  })(req, res, next)
}

// --- 未用到API (後續待刪)--- start
// retrieve all posts from db
exports.findAll = async(req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '取得所有貼文 API'
    #swagger.ignore = true
  */
  try {
    const allPost = await Post.find().populate({path:'user',select: 'userName avatar'})
    // 將 like 轉為 轉為數字後傳出 
    const modifyPostLike = allPost.reduce((prev, next) => {
      const newItem = {...next._doc}
      newItem.likes = newItem.likes.length
      prev.push(newItem)
      return prev
    },[])
    
    if (allPost) {
      successHandler(res,'success',modifyPostLike)
    } else {
      errorHandler(res, error)
    }
  } catch (error) {
    errorHandler(res, error)
  }
 
};

// find a single post by id
exports.findOne = async (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '取得單一貼文 API'
    #swagger.ignore = true
  */
  try {
    const postId = req.params.id
    const postItem = await Post.find({_id:postId})
    if(!Object.keys(postItem).length){
      errorHandler(res,"無此ID")
    }else{
      successHandler(res,'success',postItem)
    } 
  } catch (error) {
    errorHandler(res, '無此ID');
  }
};

// test post, req body
exports.testPost = async (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.ignore = true
  */
  console.log(req.body);
};
// --- 未用到API --- end

// search posts by keyword
exports.search = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
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
            "count": 1,
            "limit": 10,
            "page": 1,
            "posts": [
              {
                "user": {
                    "_id": "62741e710b0c853f222d8691",
                    "avatar": "https://randomuser.me/api/portraits/lego/3.jpg",
                    "userName": "DAT"
                },
                "postId": "627bd5634b9b3a393e5eb87c",
                "content": "測試發文",
                "image": "https://i.picsum.photos/id/817/200/300.jpg?hmac=Egrlh6ZzXMOSu9esbUDMY8PhK3cBCmeqHyWBXm7dnHQ",
                "datetime_pub": "2022-05-11T15:25:23.537Z"
              }
            ]
          }
        }
      }
    */
    let { keyword, sortby, limit = 10, page = 1, userId, authorId } = req.body;
    let filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
    let sort = sortby === 'datetime_pub' ? { createAt: -1 } : {};
    if (page < 0) {
      page = 1;
    }
    let skip = limit * (page - 1);

    if (authorId) {
      // 查詢特定使用者
      filter.user = authorId;
    } else if (userId) {
      // 動態牆搜尋：1.呈現使用者追蹤對象和自己的發文 2.使用者無追縱對象時，由系統隨機抽樣10人給使用者(不足10人使用全清單)
      const users = await User.find({ _id: userId });
      let follow = users[0] ? users[0].follow.map((item) => item.id) : [];

      if (!follow.length) {
        // 處理初始使用者未有follow時的動態牆搜尋
        // 之後可用資料庫語法來refact
        const userList = await User.find({});
        if (userList.length < 10) {
          follow = userList
            .filter((item) => item._id.toString() !== userId)
            .map((item) => item._id.toString());
        } else {
          let cumulattor = 0;
          follow = userList
            .filter((item) => {
              if (item._id.toString() === userId) {
                return false;
              }
              if (cumulattor <= 10 && Math.random() > 0.5) {
                cumulattor++;
                return true;
              } else {
                return false;
              }
            })
            .map((item) => item._id.toString());
        }
      }

      follow.push(userId);
      // console.log(follow);

      filter.user = { $in: follow };
    }

    const count = await Post.find(filter).count();
    const posts = await Post.find(filter).sort(sort).skip(skip).limit(limit).populate({
      path: 'user',
      select: 'userName avatar',
    });
    // console.log(posts);
    let resPosts = posts.map((item) => {
      return {
        user: item.user,
        postId: item._id,
        content: item.content,
        image: item.image,
        datetime_pub: item.createAt,
      };
    });
    let payload = { count, limit, page, posts: resPosts };
    res.status(200).send({ status: 'success', payload });
  })(req, res, next)
}

exports.updateComment = (req, res, next) => {
  handleErrorAsync(async (req, res, next) => {
    /*
      #swagger.tags = ['Posts - 貼文']
      #swagger.description = '留言 API'
      #swagger.security = [{ apiKeyAuth: [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: '',
        required: true,
        schema: {
          $postId: "6288960ac2049c4b43b9e5d3", 
          $userId: "62749ba20b0c853f222d8697",  
          $comment: "測試留言",
        }
      }
      #swagger.responses[200] = {
        description: '被留言之文章原始資料',
        schema: {
          "status": "success",
          "postItem": {
            "_id": "6288960ac2049c4b43b9e5d3",
            "user": "62749b880b0c853f222d8696",
            "tags": [
              "[test]"
            ],
            "type": "person",
            "image": "https://i.picsum.photos/id/817/200/300.jpg?hmac=Egrlh6ZzXMOSu9esbUDMY8PhK3cBCmeqHyWBXm7dnHQ",
            "content": "測試發文",
            "likes": [],
            "createAt": "2022-05-21T07:34:34.522Z",
            "comments": []
          }
        }
      }
    */
    const {postId,userId,comment} = req.body
    const data ={postId,userId,comment}
    const userInfo = await User.find({_id:userId})
    // const postDataComments = {userName:'sss234',userPhoto:'sssaas',message:data.comment}
    const postDataComments = {userName:userInfo[0].userName,userPhoto:userInfo[0].avatar,message:comment}
    const postItem= await Post.findOneAndUpdate({_id:postId},{ $push: { comments: postDataComments  } });

    if(!data.comment){
      appError('404', '內容不能為空', next);
    }else{
      res.status(200).send({ status: "success", postItem });
    }
  })(req, res, next)
}

exports.updateLike = (req, res, next) => {
  handleErrorAsync(async(req, res, next) => {
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
    const { userId, postId } = req.body
    // 是否存在 post , user id 
    const user = await User.findOne({_id: userId})
    const post = await Post.findOne({_id: postId})
    
    if(user !== null && post !== null){
        // 行為 
        const checkUserIdInPost = user.likeList.find( item => item === postId)
        const checkPostIdInUser = post.likes.find(item => item === userId)
        // 按讚存在 移除
        if(checkUserIdInPost && checkPostIdInUser){
          const user = await User.findByIdAndUpdate({_id: userId},
            {$pull:{likeList: postId}},
            {new: true})
          const post = await Post.findByIdAndUpdate({_id: postId},
            {$pull:{likes: userId}},
            {new: true})
            successHandler(res, {user, post})
        // 按讚不存在 寫入
        }else if(checkUserIdInPost === undefined && checkPostIdInUser === undefined){
          const user = await User.findByIdAndUpdate({_id: userId},
            {$push:{likeList: postId}},
            {new: true})
          const post = await Post.findByIdAndUpdate({_id: postId},
            {$push:{likes: userId}},
            {new: true})
          successHandler(res, {user, post})
        // 其他資料不對其問題
        }else{
          appError('404', 'post id 或  user id 有誤', next);
        }
    }else{
      appError('404', 'post id 或  user id 有誤', next);
    }
  })(req, res, next)
}

// --- 未用到API (後續待刪)--- start
// update a post by id
exports.update = async (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '編輯貼文 API'
    #swagger.ignore = true
  */
  try {
    const { userName, content, image, likes } = req.body;
    const data = { userName, content, image, likes };
    if (!data.content) {
      errorHandler(res, '內容不能為空');
    } else {
      const editPost = await Post.findByIdAndUpdate(req.params.id, data);
      console.log(editPost);
      if (!editPost) {
        errorHandler(res, '查無此ID，無法更新');
      } else {
        successHandler(res, 'success', editPost);
      }
    }
  } catch (error) {
    errorHandler(res, '查無此ID，無法更新');
  }
};

// delete a post by id
exports.delete = async (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '刪除單一貼文 API'
    #swagger.ignore = true
  */
  try {
    const postId = req.params.id;
    const deletePost = await Post.findByIdAndDelete(postId);
    if (!deletePost) {
      errorHandler(res, '刪除失敗，無此ID');
    } else {
      successHandler(res, '刪除成功');
    }
  } catch (error) {
    errorHandler(res, error);
  }
};

// delete all posts
exports.deleteAll = async (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '刪除所有貼文 API'
    #swagger.ignore = true
  */
  await Post.deleteMany({});
  successHandler(res, '全部資料已刪除');
};

// find all published posts
exports.findAllPublished = (req, res) => {
  /*
    #swagger.tags = ['Posts - 貼文']
    #swagger.description = '取得所有已發表貼文 API'
    #swagger.ignore = true
  */
};
// --- 未用到API --- end
