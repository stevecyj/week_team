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
      select: false,
    },
    content: {
      type: String,
      required: [true, "Content 未填寫"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

// ❗specific response content
// postSchema.methods.toJSON = function () {
//   return {
//     postId: this._id,
//     userName: this.userName,
//     userPhoto: this.userPhoto,
//     tags: this.tags,
//     type: this.type,
//     image: this.image,
//     content: this.content,
//     likes: this.likes,
//     comments: this.comments,
//     createAt: this.createAt,
//   };
// };

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
