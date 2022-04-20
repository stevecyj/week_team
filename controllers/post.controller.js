const Post = require("../models/post"); // model Post

// create and save a new post
exports.create = async (req, res) => {
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

    const newPost = await Post.create(dataPost);
    let resNewPost = Object.entries(newPost);
    console.log(resNewPost);
    res.status(200).send({ status: "success", payload: newPost });
  } catch (error) {}

  // Post.create(dataPost)
  //   .then(() => {
  //     console.log("資料寫入成功");
  //     res.status(200).send({ status: "success", payload: dataPost });
  //   })
  //   .catch((err) => {
  //     console.log(err.errors);
  //   });
};

// retrieve all posts from db
exports.findAll = (req, res) => {};

// find a single post by id
exports.findOne = (req, res) => {};

// update a post by id
exports.update = (req, res) => {};

// delete a post by id
exports.delete = (req, res) => {};

// delete all posts
exports.deleteAll = (req, res) => {};

// find all published posts
exports.findAllPublished = (req, res) => {};
