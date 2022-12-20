const mongoose = require("mongoose");

const tag = new mongoose.Schema(
    {
        name: String,
        numberOfQuestion: String,
        questionPerWeek: String,
        questionThisDay: String,
        accountId: { type: mongoose.Schema.Types.ObjectId, ref: "account" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("tag", tag);
