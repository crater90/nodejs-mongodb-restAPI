const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        }
    }
)

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            max: 500,
        },
        likes: {
            type: Array,
            default: [],
        },
        comments: {
            type: [CommentSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);