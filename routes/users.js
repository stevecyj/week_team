const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user.controller');
const { handleErrorAsync, isAuth } = require('../middleware');

router.post('/sign_up', usersController.signUp); // 使用者註冊
router.post('/sign_in', usersController.signIn); // 使用者登入
router.get('/profile/:id', isAuth, usersController.getProfile); // 使用者資料
router.post('/updatePassword', isAuth, usersController.updatePassword); // 修改密碼
router.patch('/updateProfile', isAuth, usersController.updateProfile);
router.post('/getFollowrs', isAuth, usersController.getUserFollowers)
router.post('/follow', isAuth, usersController.follow)
// router.get('/getAllUsers', usersController.getUsers);
// router.post('/addUser', usersController.createUser);
// router.patch('/resetPassword/:id', usersController.resetUserPassword);


module.exports = router;
