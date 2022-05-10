const mongoose = require("mongoose"); //連接資料庫
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
console.log(process.env.PORT)
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((err) => {
    console.log("資料庫無法連線", err);
    process.exit();
  });
