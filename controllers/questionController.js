const Question = require("../models/question");
const account = require("../models/account");
const tag = require("../models/tag");
const { isObjectEmpty } = require("../utils");
const deleteImageCloud = require("../middlewares/deleteImageCloud");
const { findOne, findById } = require("../models/question");
const ObjectId = require("mongodb").ObjectId;
// const account = require("../models/account")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const { title, contentTextProblem, contentTextExpect, tagIds } = req.body;

            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            if (!reqAccount) {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            const newQuestion = new Question({
                title: title,
                contentTextProblem: contentTextProblem,
                contentTextExpect: contentTextExpect,
                account: reqAccount._id,
                like: 0,
                dislike: 0,
                numberOfView: 0,
                tagIds: tagIds,
            });

            await newQuestion.save();
            return res.send({
                result: "success",
                question: newQuestion,
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    find: async (req, res) => {
        let { q } = req.query;
        q = q ?? "";
        page = parseInt(req.query.page) - 1;
        limit = parseInt(req.query.limit);
        let sortByCreateTime = parseInt(req.query.sortByCreateTime);
        try {
            var query = { title: { $regex: `.*${q}.*`, $options: "i" } };
            Question.find(query)
                .populate({ path: "account", select: "avatar fullname" })
                .populate({ path: "tagIds", select: "name" })
                .sort({ createdAt: sortByCreateTime })
                .skip(page * limit) //Notice here
                .limit(limit)
                .exec((err, doc) => {
                    if (err) {
                        return res.json(err);
                    }
                    Question.countDocuments(query).exec((count_error, count) => {
                        if (err) {
                            return res.json(count_error);
                        }
                        return res.json({
                            count: count,
                            page: page + 1,
                            limit: limit,
                            questions: doc,
                        });
                    });
                });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { _id } = req.query;
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            const question = await Question.findById(_id);

            if (!reqAccount || !reqAccount._id.equals(question.account)) {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            await question.delete();
            return res.status(200).json({
                result: "success",
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    findPersonally: async (req, res) => {
        try {
            let { _id, q } = req.query;
            q = q ?? "";
            page = parseInt(req.query.page) - 1;
            limit = parseInt(req.query.limit);
            let sortByCreateTime = parseInt(req.query.sortByCreateTime);

            if (_id) {
                var query = { account: _id, title: { $regex: `.*${q}.*`, $options: "i" } };
                Question.find(query)
                    .populate({ path: "account", select: "avatar fullname" })
                    .sort({ createdAt: sortByCreateTime })
                    .skip(page * limit) //Notice here
                    .limit(limit)
                    .exec((err, doc) => {
                        if (err) {
                            return res.json(err);
                        }
                        Question.countDocuments(query).exec((count_error, count) => {
                            if (err) {
                                return res.json(count_error);
                            }
                            return res.json({
                                count: count,
                                page: page + 1,
                                limit: limit,
                                questions: doc,
                            });
                        });
                    });
            } else {
                const accessToken = req.headers.authorization.split(" ")[1];
                const reqAccount = await account.findOne({
                    accessToken: accessToken,
                });
                if (!reqAccount) {
                    return res.status(403).send({
                        result: "failed",
                        message: "Không có quyền thực thi",
                    });
                }
                var query = { account: reqAccount._id, title: { $regex: `.*${q}.*`, $options: "i" } };
                Question.find(query)
                    .populate({ path: "account", select: "avatar fullname" })
                    .sort({ createdAt: sortByCreateTime })
                    .skip(page * limit) //Notice here
                    .limit(limit)
                    .exec((err, doc) => {
                        if (err) {
                            return res.json(err);
                        }
                        Question.countDocuments(query).exec((count_error, count) => {
                            if (err) {
                                return res.json(count_error);
                            }
                            return res.json({
                                count: count,
                                page: page + 1,
                                limit: limit,
                                questions: doc,
                            });
                        });
                    });
            }
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    detail: async (req, res) => {
        try {
            const { _id } = req.query;
            const question = await Question.findById(_id).populate({ path: "account", select: "avatar fullname" });

            if (question) {
                return res.status(200).json({
                    result: "success",
                    question: question,
                });
            } else {
                return res.status(404).json({
                    result: "failed",
                    message: "Không tìm thấy câu hỏi",
                });
            }
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
};

module.exports = questionController;
