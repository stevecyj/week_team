const PostAddPost = require("../models/post.model"); // model Post

// create and save a new post
exports.create = async (req, res) => {
  console.log(req.body);
  try {
    let dataPost = {
      userName: req.body.userName,
      userPhoto: req.body.userPhoto,
      tags: req.body.tags,
      type: req.body.type,
      image: req.body.image,
      content: req.body.content,
      likes: req.body.likes,
      comments: req.body.comments,
    };

    const newPost = await PostAddPost.create(dataPost);

    let payload = { postId: newPost._id };
    res.status(200).send({ status: "success", payload });
  } catch (error) {}
};

// retrieve all posts from db
exports.findAll = (req, res) => {};

// find a single post by id
exports.findOne = (req, res) => {};

// search posts by keyword
exports.search = (req, res) => {
  let dataSearch = req.body;
  console.log(dataSearch);
};

// update a post by id
exports.update = (req, res) => {};

// delete a post by id
exports.delete = (req, res) => {};

// delete all posts
exports.deleteAll = (req, res) => {};

// find all published posts
exports.findAllPublished = (req, res) => {};
