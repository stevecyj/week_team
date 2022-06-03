const { successHandler } = require('../server/handle');
const { appError } = require('../exceptions');
const { ImgurClient } = require('imgur');

exports.uploadImage = async (req, res, next) => {
  if (!req.files.length) {
    appError(400, '尚未選取到需上傳的照片', next);
  }

  const client = new ImgurClient({
    clientId: process.env.IMGUR_CILENTID,
    clientSecret: process.env.IMGUR_CILENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });
  const response = await client.upload({
    image: req.files[0].buffer.toString('base64'),
    type: 'base64',
    album: process.env.IMGUR_ALBUM_ID,
  });
  successHandler(res, 'success', { imgurl: response.data.link });
};
