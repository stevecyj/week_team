const Post = require("../models/post.model"); // model Post
const User = require("../models/user.model");
const { successHandler, errorHandler } =require('../server/handle')
// create and save a new post
exports.create = async (req, res) => {
  try {
    let dataPost = {
      user: req.body.user,
      userName: req.body.userName,
      userPhoto: req.body.userPhoto,
      tags: req.body.tags,
      type: req.body.type || "person",
      image: req.body.image,
      content: req.body.content,
      likes: req.body.likes,
      comments: req.body.comments,
    };
    if(!dataPost.content){
      errorHandler(res,"內容不能為空")
    }else{
      const newPost = await Post.create(dataPost);
      let payload = { postId: newPost._id };
      successHandler(res,'success',payload)
    }
  } catch (error) {
    errorHandler(res,error)
  }
};

// retrieve all posts from db
exports.findAll = async(req, res) => {
  const allPost = await Post.find()
  successHandler(res,'success',allPost)
};

// find a single post by id
exports.findOne = async(req, res) => {
  try {
    const postId = req.params.id
    const postItem = await Post.find({_id:postId})
    if(!Object.keys(postItem).length){
      errorHandler(res,"無此ID")
    }else{
      successHandler(res,'success',postItem)
    }
  } catch (error) {
    errorHandler(res,"無此ID")
  }
};

// search posts by keyword
exports.search = async (req, res) => {
  try {
    let { keyword, sortby, limit = 10, page = 1, userId, authorId } = req.body;
    let filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
    let sort = sortby === "datetime_pub" ? { createAt: -1 } : {};
    if (page < 0) {
      page = 1;
    }
    let skip = limit * (page - 1);

    if(authorId) { // 查詢特定使用者
      filter.user = authorId;
    }
    else if(userId) { // 動態牆搜尋：1.呈現使用者追蹤對象和自己的發文 2.使用者無追縱對象時，由系統隨機抽樣10人給使用者(不足10人使用全清單)
      const users = await User.find({ _id: userId });
      let follow = users[0] ? users[0].follow.map(item => item.id) : [];

      if(!follow.length) { // 處理初始使用者未有follow時的動態牆搜尋 
        // 之後可用資料庫語法來refact
        const userList = await User.find({});
        if(userList.length < 10) {
          follow = userList.filter(item => item._id.toString() !== userId).map(item => item._id.toString());
        }
        else{
          let cumulattor = 0;
          follow = userList
            .filter(item => {
              if(item._id.toString() === userId) { return false };
              if(cumulattor <= 10 && Math.random() > 0.5) {
                cumulattor++;
                return true;
              }
              else {
                return false;
              }
            })
            .map(item => item._id.toString());
        }
      }

      follow.push(userId);
      // console.log(follow);

      filter.user = { $in: follow }
    }

    const count = await Post.find(filter).count();
    const posts = await Post.find(filter).sort(sort).skip(skip).limit(limit).populate({
      path: 'user',
      select: 'userName avatar'
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
    res.status(200).send({ status: "success", payload });
  } catch (error) {
    errorHandler(res,"error")
  }
};

exports.updateComment = async(req,res)=>{
  try {
    const {postId,userId,comment} = req.body
    const data ={postId,userId,comment}
    // 差 userModel 取得 留言者 userName userPhoto
    const postDataComments = {userName:'sss234',userPhoto:'sssaas',message:data.comment}
  
    const postItem= await Post.findOneAndUpdate({_id:postId},{ $push: { comments: postDataComments  } });
    console.log(postItem)

    if(!data.comment){
      errorHandler(res,"內容不能為空")
    }else{
      
      res.status(200).send({ status: "success",postItem });
    }
  } catch (error) {
    errorHandler(res,error)
  }
}

// update a post by id
exports.update = async(req, res) => {
  try {
    const {userName,content,image,likes} = req.body 
    const data ={userName,content,image,likes}
    if(!data.content){
      errorHandler(res,"內容不能為空")
    }else{
      const editPost = await Post.findByIdAndUpdate(req.params.id, data);
      console.log(editPost)
      if(!editPost){
        errorHandler(res,"查無此ID，無法更新")
      }else{
        successHandler(res,'success',editPost)
      }
    }
  } catch (error) {
    errorHandler(res,"查無此ID，無法更新")

  }
};

// delete a post by id
exports.delete = async(req, res) => {
  try {
    const postId = req.params.id
    const deletePost = await Post.findByIdAndDelete(postId)
    if(!deletePost){
      errorHandler(res,'刪除失敗，無此ID')
    }else{
      successHandler(res,"刪除成功")
    }
  } catch (error) {
    errorHandler(res,error)
  }
};

// delete all posts
exports.deleteAll = async(req, res) => {
  await Post.deleteMany({});
  successHandler(res,"全部資料已刪除")
};



// find all published posts
exports.findAllPublished = (req, res) => {};
