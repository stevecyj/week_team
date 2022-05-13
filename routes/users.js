const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user.controller');
const { handleErrorAsync } = require('../middleware');

router.post('/sign_up', handleErrorAsync(usersController.signUp)); // 使用者註冊
router.post('/sign_in', handleErrorAsync(usersController.signIn)); // 使用者登入

router.get('/getAllUsers', usersController.getUsers);
router.post('/addUser', usersController.createUser);
router.patch('/resetPassword/:id', usersController.resetUserPassword);

module.exports = router;
