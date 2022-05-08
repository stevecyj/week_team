const Post = require("../models/post.model"); // model Post
const User = require("../models/user.model");
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
    const newPost = await Post.create(dataPost);
    let payload = { postId: newPost._id };
    res.status(200).send({ status: "success", payload });
  } catch (error) {
    console.log(error);
  }
};

// retrieve all posts from db
exports.findAll = (req, res) => {};

// find a single post by id
exports.findOne = (req, res) => {};

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
      let follow = users[0].follow

      if(!follow.length) { // 處理初始使用者未有follow時的動態牆搜尋 
        // 之後可用資料庫語法來refact
        const userList = await User.find({});
        if(userList.length <= 10) {
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
    console.log(error);
  }
};

// update a post by id
exports.update = (req, res) => {};

// delete a post by id
exports.delete = (req, res) => {};

// delete all posts
exports.deleteAll = (req, res) => {};

// find all published posts
exports.findAllPublished = (req, res) => {};
