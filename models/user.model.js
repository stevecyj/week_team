const mongoose = require('mongoose');
const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'email為必填欄位'],
            unique: true,
            lowercase: true,
            select: false
        },
        userName: {
            type: String,
            required: [true, "暱稱未填寫"],
        },
        password: {
            type: String,
            required: [true, "尚未設定密碼"],
            select: false
        },
        avatar: {
            type: String,
            default: 'https://randomuser.me/api/portraits/lego/3.jpg'
        },
        gender: {
            type: String,
            enum: ['female', 'male', 'notAccess'],
            default: 'notAccess'
        },
        follow: { // 追縱
            type: [{id: {type: String}, datetime_update: {type: Date, default: Date.now}}],
            default: []
        },
        beFollowed: {
            type: [{id: {type: String}, datetime_update: {type: Date, default: Date.now}}],
            default: []
        },
        likeList: {
            type: [String],
            default: []
        },
        createAt: {
            type: Date,
            default: Date.now,
        },
        updateAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        versionKey: false, // 去除__v欄位
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;