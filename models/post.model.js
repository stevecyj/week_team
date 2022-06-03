const mongoose = require('mongoose');
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '使用者資訊未填寫'],
    },
    tags: [
      {
        type: String,
        required: [true, '貼文標籤 tags 未填寫'],
      },
    ],
    type: {
      type: String,
      enum: ['group', 'person'],
      required: [true, '貼文類型 type 未填寫'],
    },
    image: {
      type: String,
      default: '',
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: [true, 'Content 未填寫'],
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
