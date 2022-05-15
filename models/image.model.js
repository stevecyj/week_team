const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
    },
    {
        versionKey: false,
    }
);


const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
