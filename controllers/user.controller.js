const User = require("../models/user.model");
const { successHandle, errorHandle } = require('../service')

const users = {
  async getUsers (req, res) {
    const allUsers = await User.find()
    successHandle(res, allUsers)
  },
  async createUser (req, res) {
    try {
      const { body } = req
      if (body.email && body.userName && body.password) {
        const newUser = await User.create({
          email: body.email,
          userName: body.userName,
          password: body.password,
          avatar: body.avatar,
          gender: body.gender,
          follow: body.follow,
          beFollowed: body.beFollowed,
          likeList: body.likeList,
        })
        successHandle(res, newUser)
      } else {
        errorHandle(res)
      }
    } catch (err) {
      errorHandle(res, err)
    }
  },
  async resetUserPassword (req, res) {
    try {
      const { id } = req.params
      const { body } = req
      const updateUser = await User.findById(id)
      if (updateUser && body.password) {
        const result = await User.findByIdAndUpdate(id, body)
        result ? successHandle(res, updateUser) : errorHandle(res)
      } else {
        errorHandle(res)
      }
    } catch (err) {
      errorHandle(res, err)
    }
  },
}

module.exports = users;