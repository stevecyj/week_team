var express = require('express');
var router = express.Router();
const fileController = require("../controllers/file.controller");
const uploadImage = require('../service/image');
const { isAuth } = require('../middleware');




router.post('/uploadImage', isAuth ,uploadImage,fileController.uploadImage)

module.exports = router;





