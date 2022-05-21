const { successHandler, errorHandler } =require('../server/handle')
const Image = require('../models/image.model')
const fs = require('fs');
const request = require("request-promise")
const { options } = require('../routes/users');


exports.show = async(req,res)=>{
  /*
    #swagger.tags = ['Files - 圖片上傳']
    #swagger.description = '取得圖片 API'
    #swagger.ignore = true
  */
  res.send(allImage);
}

exports.uploadImage = async (req,res)=>{
  /*
    #swagger.tags = ['Files - 圖片上傳']
    #swagger.description = '上傳圖片取得圖片網址 API'
    #swagger.ignore = true
  */
    const encode_image = req.file.buffer.toString('base64')
    var imgData = {}
    let options = {
      'method': 'POST',
      'url': 'https://api.imgur.com/3/image',
      'headers': {
          'Authorization': 'Client-ID 40c34e1b8246f71'
      },
      formData: {
          'image': encode_image}
    };
    await request(options, function (error, response) {
      if (error) throw new Error(error);
      imgurRes = JSON.parse(response.body)
      console.log(imgurRes.data.link)
      imgData = {
        imageName: req.file.originalname,
        imageUrl : imgurRes.data.link
      }
    });
    const newImage = await Image.create(imgData)
    successHandler(res,'success',newImage)
}

