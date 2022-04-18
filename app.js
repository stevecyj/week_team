var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose"); //連接資料庫
mongoose
  .connect("mongodb://localhost:27017/posts")
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((err) => {
    console.log(err);
  });

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "貼文姓名未填寫"],
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
const Post = mongoose.model("Post", postSchema);

// 實體 instance
const testPost = new Post({
  name: "test",
  tags: "food",
  type: "group",
  image: "",

  content: "test",
  likes: 0,
  comments: 0,
});

testPost
  .save()
  .then(() => {
    console.log("新增資料成功");
  })
  .catch((err) => {
    console.log(err);
  });

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
