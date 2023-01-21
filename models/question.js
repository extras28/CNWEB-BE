const mongoose = require("mongoose");

const Question = new mongoose.Schema(
    {
        account: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
        tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "tag" }],
        answer: [{ type: mongoose.Schema.Types.ObjectId, ref: "answer" }],
        title: String,
        contentTextProblem: String,
        contentTextExpect: String,
        numberOfView: Number,
        likes: Array,
        likeCount: Number,
        dislikes: Array,
        dislikeCount: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("question", Question);
