const mongoose = require("mongoose");

const Question = new mongoose.Schema(
    {
        account: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
        tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "tag" }],
        title: String,
        contentTextProblem: String,
        contentTextExpect: String,
        contentImageProblem: {
            path: String,
            filename: String,
        },
        contentImageExpect: {
            path: String,
            filename: String,
        },
        numberOfView: Number,
        like: Number,
        dislike: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("question", Question);
