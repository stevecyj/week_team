const Post = require("../models/post.model"); // model Post

// create and save a new post
exports.create = async (req, res) => {
  try {
    let dataPost = {
      userName: req.body.userName,
      userPhoto: req.body.userPhoto,
      tags: req.body.tags,
      type: req.body.type || 'person',
      image: req.body.image,
      content: req.body.content,
      likes: req.body.likes,
      comments: req.body.comments,
    };
    const newPost = await Post.create(dataPost);
    let payload = { postId: newPost._id };
    res.status(200).send({ status: "success", payload });
  }
  catch (error) {
    console.log(error);
  }
};

// retrieve all posts from db
exports.findAll = (req, res) => {};

// find a single post by id
exports.findOne = (req, res) => {};

// search posts by keyword
exports.search = async (req, res) => {
  console.log(req.body);
  try{
    let {keyword, sortby, limit = 10, page = 1} = req.body;
    let filter = keyword ? {content: new RegExp(`${keyword}`)} : {};
    let sort = sortby === 'datetime_pub' ? {'createAt': 1} : {};
    let skip = limit * (page - 1);

    const count = await Post.find(filter).count();
    const posts = await Post.find(filter).sort(sort).skip(skip).limit(limit);
    // console.log(posts);
    let resPosts = posts.map((item) => {
      return {
        postId: item._id,
        userName: item.userName,
        userPhoto: item.userPhoto,
        content: item.content,
        image: item.image,
        datetime_pub: item.createAt
      }
    })
    let payload = { count, limit, page, posts: resPosts};
    res.status(200).send({ status: "success", payload });
  }
  catch(error) {
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
