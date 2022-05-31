var express = require("express");
var router = express.Router();
const postsController = require("../controllers/post.controller");
const { isAuth } = require('../middleware');

// create and save a new post
router.post("/addPost", isAuth, postsController.create);

// search posts by keyword
router.post("/search", isAuth, postsController.search);

// add Comment by post id
router.post("/addComment/:id", isAuth, postsController.addComment);
// delete Comment by post id 
router.delete("/deleteComment/:id", isAuth ,postsController.delComment);
// update Comment by post id 
router.patch("/updateComment/:id", isAuth ,postsController.updateComment);

// update a like by post id and user id 
router.patch("/updateLike/", isAuth, postsController.updateLike);

// retrieve all posts from db
router.get("/getAllPosts", postsController.findAll);

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
