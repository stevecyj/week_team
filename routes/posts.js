var express = require("express");
var router = express.Router();
const postsController = require("../controllers/post.controller");

// create and save a new post
router.post("/addPost", postsController.create);

// retrieve all posts from db
router.get("/getAllPosts", postsController.findAll);

// find a single post by id
router.get("/getOnePost/:id", postsController.findOne);

// search posts by keyword
router.get("/search/:keyword", postsController.search);

// update a post by id
router.put("/updatePost/:id", postsController.update);

// delete a post by id
router.delete("/deletePost/:id", postsController.delete);

// delete all posts
router.delete("/deleteAllPosts", postsController.deleteAll);

// find all published posts
router.get("/getAllPublishedPosts", postsController.findAllPublished);

module.exports = router;
