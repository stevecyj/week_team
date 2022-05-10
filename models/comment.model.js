const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
        },
        userPhoto: {
            type: String,
        },
        message: {
            type: String,
        },
    },
    {
        versionKey: false,
    }
);


const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
