const mongoose = require("mongoose");

const Answer = new mongoose.Schema(
    {
        account: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
        tempId: String,
        content: String,
        likes: Array,
        likeCount: Number,
        dislikes: Array,
        dislikeCount: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("answer", Answer);
