const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user.controller");

router.post("/sign_up", usersController.signUp);
// router.post(
//   "/sign_in",
//   handleErrorAsync(async (req, res, next) => {})
// );

router.get("/getAllUsers", usersController.getUsers);
router.post("/addUser", usersController.createUser);
router.patch("/resetPassword/:id", usersController.resetUserPassword);

module.exports = router;
