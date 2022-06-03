var express = require('express');
var router = express.Router();
const fileController = require('../controllers/file.controller');
const uploadImage = require('../service/image');
const { isAuth, handleErrorAsync } = require('../middleware');

router.post(
  '/image',
  isAuth,
  uploadImage,
  handleErrorAsync(async (req, res, next) => {
    /*
    #swagger.tags = ['Files - 圖片上傳']
    #swagger.description = '上傳圖片取得圖片網址 API'
  */
    fileController.uploadImage(req, res, next);
  })
);

module.exports = router;
