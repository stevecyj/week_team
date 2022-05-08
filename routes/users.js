const express = require('express');
const router = express.Router();
const usersController = require("../controllers/user.controller");

router.get('/getAllUsers', usersController.getUsers);
router.post('/addUser', usersController.createUser);
router.patch('/resetPassword/:id', usersController.resetUserPassword);

module.exports = router;
