var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

// const { resErrorProd, resErrorDev } = require("./service");
const {
  uncaughtException,
  unhandledRejection,
  errorResponder,
  error404,
} = require("./exceptions");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var postsRouter = require("./routes/posts");

var app = express();

// 程式出現重大錯誤時
process.on("uncaughtException", uncaughtException);

require("./connections");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

// catch 404 and forward to error handler
app.use(error404);

// error handler
app.use(errorResponder);

// 未捕捉到的 catch
process.on("unhandledRejection", unhandledRejection);
module.exports = app;
