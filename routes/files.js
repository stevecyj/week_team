var express = require('express');
var router = express.Router();
const fileController = require("../controllers/file.controller");
const multer = require('multer');



var upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' ) {
            cb(null, true)
        } else {
            cb(null, false)
            return cb(new Error('Allowed .jpeg .jpg'))
        }
    }
})

/* GET home page. */
router.get('/',fileController.show);

router.post('/uploadImage',upload.single('file'),fileController.uploadImage)

module.exports = router;





// 

// const upload = multer({
//     storage:storage,
//     limits:{
//         fileSize: 1024*1024*3
//     },
//     fileFilter: fileFilter
// })