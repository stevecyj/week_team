const { successHandler, errorHandler } =require('../server/handle')
const Image = require('../models/image.model')
const fs = require('fs')


exports.show = async(req,res)=>{
  res.send(allImage);
}

exports.uploadImage = async (req,res)=>{
    // upload.single('image')
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64'); //將圖片做base64編碼
    var finalImg = {
        contentType: req.file.mimetype,
        image:  new Buffer(encode_image, 'base64')
    };
    const newImage = await Image.create(finalImg)
    successHandler(res,'success',newImage)
}

