const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "貼文姓名未填寫"],
    },
    userPhoto: {
      type: String,
      required: [true, "貼文照片未上傳"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, "使用者資訊未填寫"],
    },
    tags: [
      {
        type: String,
        required: [true, "貼文標籤 tags 未填寫"],
      },
    ],
    type: {
      type: String,
      enum: ["group", "person"],
      required: [true, "貼文類型 type 未填寫"],
    },
    image: {
      type: String,
      default: "",
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      new mongoose.Schema({
        userName: String,
        userPhoto: String,
        message : String
      })
    ]
  },
  {
    versionKey: false,
  }
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
