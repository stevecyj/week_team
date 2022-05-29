const { successHandler} =require('../server/handle')
const { handleErrorAsync } = require('../middleware');
const { appError } = require("../exceptions");
const { ImgurClient } = require('imgur');



exports.uploadImage = (req, res, next) =>{
  handleErrorAsync (async (req,res,next)=>{
    /*
      #swagger.tags = ['Files - 圖片上傳']
      #swagger.description = '上傳圖片取得圖片網址 API'
      #swagger.ignore = true
    */
      if(!req.files.length){
        return next(appError(400,"尚未選取到需上傳的照片",next))
      }
      
      // const dimensions = sizeOf(req.files[0].buffer)
      // if(dimensions.width !== dimensions.height){
      //   return next(appError(400,"尚未上傳檔案",next))
      // }
      const client = new ImgurClient({
        clientId : process.env.IMGUR_CILENTID,
        clientSecret : process.env.IMGUR_CILENT_SECRET,
        refreshToken : process.env.IMGUR_REFRESH_TOKEN
      })
      const response = await client.upload({
        image : req.files[0].buffer.toString('base64'),
        type  : 'base64',
        album : process.env.IMGUR_ALBUM_ID
      })
      successHandler(res,'success',{imgurl:response.data.link})
  })(req,res,next)
} 

