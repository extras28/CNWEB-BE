const mongoose = require("mongoose");

const tag = new mongoose.Schema(
    {
        name: String,
        description: String,
        numberOfQuestion: Number,
        questionPerWeek: Number,
        questionThisDay: Number,
        account: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tag", tag);
