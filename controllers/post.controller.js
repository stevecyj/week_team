const Post = require('../models/post.model'); // model Post
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const { successHandler } = require('../server/handle');
const { appError } = require('../exceptions');

// create and save a new post
exports.create = async (req, res, next) => {
  const userId = req.user.id;
  const isUser = await User.findById(userId).exec();
  if (!isUser) {
    appError('400', '找不到此用戶ID', next);
  }
  const { content, image, likes, tags } = req.body;
  let dataPost = {
    user: userId,
    tags,
    type: req.body.type || 'person',
    image,
    content,
    likes,
  };
  if (!dataPost.content) {
    appError('400', '內容不能為空', next);
  } else {
    const newPost = await Post.create(dataPost);
    let payload = { postId: newPost._id };
    successHandler(res, 'success', payload);
  }
};

// search posts by keyword
exports.search = async (req, res, next) => {
  let { keyword, sortby, limit = 10, page = 1, userId, authorId } = req.body;
  let filter = keyword ? { content: new RegExp(`${keyword}`) } : {};
  let sort = sortby === 'datetime_pub' ? { createAt: -1 } : sortby === 'datetime_pub_asc' ? { createAt: 1 } : {};
  if (page < 0) {
    page = 1;
  }
  let skip = limit * (page - 1);

  if (authorId) {
    // 查詢特定使用者
    filter.user = authorId;
  } else if (userId) {
    // 動態牆搜尋：1.呈現使用者追蹤對象和自己的發文 2.使用者無追縱對象時，由系統隨機抽樣10人給使用者(不足10人使用全清單)
    const users = await User.find({ _id: userId });
    let follow = users[0] ? users[0].follow.map((item) => item.id) : [];

    if (!follow.length) {
      // 處理初始使用者未有follow時的動態牆搜尋
      // 之後可用資料庫語法來refact
      const userList = await User.find({});
      if (userList.length < 10) {
        follow = userList
          .filter((item) => item._id.toString() !== userId)
          .map((item) => item._id.toString());
      } else {
        let cumulattor = 0;
        follow = userList
          .filter((item) => {
            if (item._id.toString() === userId) {
              return false;
            }
            if (cumulattor <= 10 && Math.random() > 0.5) {
              cumulattor++;
              return true;
            } else {
              return false;
            }
          })
          .map((item) => item._id.toString());
      }
    }

    follow.push(userId);
    // console.log(follow);

    filter.user = { $in: follow };
  }

  const count = await Post.find(filter).count();
  const posts = await Post.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'user',
      select: 'userName avatar',
    })
    .populate({
      path: 'comments',
      select: 'user comment createdAt',
    });
  console.log(posts);
  let resPosts = posts.map((item) => {
    return {
      user: item.user,
      postId: item._id,
      content: item.content,
      image: item.image,
      datetime_pub: item.createAt,
      comments: item.comments,
      likes: item.likes
    };
  });
  let payload = { count, limit, page, posts: resPosts };
  res.status(200).send({ status: 'success', payload });
};

exports.getLikedPosts = async (req, res, next) => {
  let { s: limit, p: page } = req.query;
  limit = +limit;
  page = +page;
  if (!(page > 0)) {
    page = 1;
  }
  if (!(limit > 0)) {
    limit = 10;
  }
  const likedPosts = req.user.likeList;
  let filter = { _id: { $in: likedPosts } };
  let sort = { createAt: -1 };
  let skip = +limit * (+page - 1);
  const count = await Post.find(filter).count();
  const posts = await Post.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(+limit)
    .populate({ path: 'user', select: 'userName avatar' })
    .populate({ path: 'comments', select: 'user comment createdAt' });
  let resPosts = posts.map((item) => {
    return {
      user: item.user,
      postId: item._id,
      content: item.content,
      image: item.image,
      datetime_pub: item.createAt,
      comments: item.comments,
      likes: item.likes
    };
  });
  let payload = { count, limit, page, posts: resPosts };

  successHandler(res, 'success', payload);
};

exports.addComment = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.id;
  const { comment } = req.body;
  const userInfo = await User.findById(userId, 'id userName avatar').exec();
  if (!userInfo) {
    appError('400', '無此發文者ID', next);
  }

  if (!comment) {
    appError('400', '無填寫留言', next);
  }

  const newComment = await Comment.create({
    post: postId,
    user: userInfo,
    comment,
  });
  successHandler(res, 'success', { comments: newComment });
};

exports.delComment = async (req, res, next) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const commentInfo = await Comment.findById(commentId).exec();
  if (!commentInfo) {
    appError('400', '無此留言', next);
  }
  if (userId === commentInfo.user.id) {
    await Comment.findByIdAndDelete(commentInfo);
  } else {
    appError('400', '不同 userId 無法刪除', next);
  }
  successHandler(res, 'success', '已刪除此留言');
};

exports.updateComment = async (req, res, next) => {
  const userId = req.user.id;
  const commentId = req.params.id;
  const { comment } = req.body;
  const commentInfo = await Comment.findById(commentId).exec();
  if (!commentInfo) {
    appError('400', '無此留言或已刪除', next);
  }

  if (userId === commentInfo.user.id) {
    await Comment.findByIdAndUpdate(commentId, { comment });
  } else {
    appError('400', '不同 userId 無法編輯留言', next);
  }
  const newComment = await Comment.findById(commentId).exec();
  successHandler(res, 'success', newComment);
};

exports.updateLike = async (req, res, next) => {
  const { userId, postId } = req.body;
  // 是否存在 post , user id
  const user = await User.findOne({ _id: userId });
  const post = await Post.findOne({ _id: postId });

  if (user !== null && post !== null) {
    // 行為
    const checkUserIdInPost = user.likeList.find((item) => item === postId);
    const checkPostIdInUser = post.likes.find((item) => item === userId);
    // 按讚存在 移除
    if (checkUserIdInPost && checkPostIdInUser) {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { likeList: postId } },
        { new: true }
      );
      const post = await Post.findByIdAndUpdate(
        { _id: postId },
        { $pull: { likes: userId } },
        { new: true }
      );
      successHandler(res, 'success', { userId: user._id, postId: post.id });
      // 按讚不存在 寫入
    } else if (checkUserIdInPost === undefined && checkPostIdInUser === undefined) {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { likeList: postId } },
        { new: true }
      );
      const post = await Post.findByIdAndUpdate(
        { _id: postId },
        { $push: { likes: userId } },
        { new: true }
      );
      successHandler(res, 'success', { userId: user._id, postId: post.id });
      // 其他資料不對其問題
    } else {
      appError('404', 'post id 或  user id 有誤', next);
    }
  } else {
    appError('404', 'post id 或  user id 有誤', next);
  }
};
