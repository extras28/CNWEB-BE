const mongoose = require('mongoose');

const Question = new mongoose.Schema({
    accountId: String,
    tagId: String,
    title: String,
    contentTextProblem: String,
    contentTextExpect: String,
    contentImageProblem: String,
    contentImageExpect: String,
    numberOfView: Number,
    like: Number,
    dislike: Number,
}, {
    timestamps: true,
});

module.exports = mongoose.model('Question', Question);
