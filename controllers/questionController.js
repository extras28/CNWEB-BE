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

            for (let i = 0; i < tagIds.length; i++) {
                tag.findByIdAndUpdate(
                    tagIds[i],
                    {
                        $inc: { numberOfQuestion: 1 },
                    },
                    { new: true },
                    function (err, doc) {
                        if (err) return console.log(err);
                        console.log(doc);
                    }
                );
            }

            const newQuestion = new Question({
                title: title,
                contentTextProblem: contentTextProblem,
                contentTextExpect: contentTextExpect,
                account: reqAccount._id,
                likeCount: 0,
                dislikeCount: 0,
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
        like = parseInt(req.query.like) * -1;
        dislike = parseInt(req.query.dislike) * -1;
        let sortByCreateTime = parseInt(req.query.sortByCreateTime) * -1;
        try {
            var query = { title: { $regex: `.*${q}.*`, $options: "i" } };
            Question.find(query)
                .populate({ path: "account", select: "avatar fullname" })
                .populate({ path: "tagIds", select: "name" })
                .sort({ dislikeCount: dislike, likeCount: like, createdAt: sortByCreateTime })
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
            const tagIds = question.tagIds;

            if ((!reqAccount || !reqAccount._id.equals(question.account)) && reqAccount.accountLevel !== "ADMIN") {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            for (let i = 0; i < tagIds.length; i++) {
                tag.findByIdAndUpdate(
                    tagIds[i],
                    {
                        $inc: { numberOfQuestion: -1 },
                    },
                    { new: true },
                    function (err, doc) {
                        if (err) return console.log(err);
                        console.log(doc);
                    }
                );
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
            const question = await Question.findById(_id)
                .populate({ path: "account", select: "avatar fullname" })
                .populate({ path: "tagIds" })
                .populate({
                    path: "answer",
                    populate: {
                        path: "account",
                        select: "avatar fullname",
                    },
                });

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

    update: async (req, res) => {
        try {
            const { _id, title, contentTextProblem, contentTextExpect, tagIds } = req.body;

            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            if (!reqAccount && reqAccount.accountLevel !== "ADMIN") {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }
            const updatedQuestion = await Question.findByIdAndUpdate(
                _id,
                {
                    title: title,
                    contentTextProblem: contentTextProblem,
                    contentTextExpect: contentTextExpect,
                    tagIds: tagIds,
                },
                { new: true }
            );

            if (updatedQuestion) {
                return res.send({
                    result: "success",
                    question: updatedQuestion,
                });
            } else {
                return res.status(400).send({
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

    // delete: async (req, res) => {
    //     try {
    //         const { _id } = req.query;
    //         const deletedQuestion = await Question.findByIdAndDelete(_id);
    //         if (deletedQuestion) {
    //             return res.send({
    //                 result: "success",
    //             });
    //         } else {
    //             return res.status(400).send({
    //                 result: "failed",
    //                 message: "Không tìm thấy câu hỏi",
    //             });
    //         }
    //     } catch (error) {
    //         res.status(400).send({
    //             result: "failed",
    //             message: error.message,
    //         });
    //     }
    // },

    react: async (req, res) => {
        try {
            const { _id } = req.body;
            const reactType = parseInt(req.body.reactType);
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
            const question = await Question.findById(_id);

            let updatedQuestion;

            const alreadyLike = question.likes.includes(reqAccount._id);
            const alreadyDislike = question.dislikes.includes(reqAccount._id);

            if (reactType === 1 && alreadyLike) {
                updatedQuestion = await Question.findByIdAndUpdate(
                    _id,
                    {
                        $inc: { likeCount: -1 },
                        $pull: { likes: reqAccount._id },
                    },
                    { new: true }
                )
                    .populate({ path: "account", select: "avatar fullname" })
                    .populate({ path: "tagIds", select: "name" });
            } else if (reactType == 1 && !alreadyLike) {
                if (alreadyDislike) {
                    updatedQuestion = await Question.findByIdAndUpdate(
                        _id,
                        {
                            $inc: { likeCount: 1, dislikeCount: -1 },
                            $push: { likes: reqAccount._id },
                            $pull: { dislikes: reqAccount._id },
                        },
                        { new: true }
                    )
                        .populate({ path: "account", select: "avatar fullname" })
                        .populate({ path: "tagIds", select: "name" });
                } else {
                    updatedQuestion = await Question.findByIdAndUpdate(
                        _id,
                        {
                            $inc: { likeCount: 1 },
                            $push: { likes: reqAccount._id },
                        },
                        { new: true }
                    )
                        .populate({ path: "account", select: "avatar fullname" })
                        .populate({ path: "tagIds", select: "name" });
                }
            } else if (reactType == 0 && alreadyDislike) {
                updatedQuestion = await Question.findByIdAndUpdate(
                    _id,
                    {
                        $inc: { dislikeCount: -1 },
                        $pull: { dislikes: reqAccount._id },
                    },
                    { new: true }
                )
                    .populate({ path: "account", select: "avatar fullname" })
                    .populate({ path: "tagIds", select: "name" });
            } else if (reactType == 0 && !alreadyDislike) {
                if (alreadyLike) {
                    updatedQuestion = await Question.findByIdAndUpdate(
                        _id,
                        {
                            $inc: { likeCount: -1, dislikeCount: 1 },
                            $push: { dislikes: reqAccount._id },
                            $pull: { likes: reqAccount._id },
                        },
                        { new: true }
                    )
                        .populate({ path: "account", select: "avatar fullname" })
                        .populate({ path: "tagIds", select: "name" });
                } else {
                    updatedQuestion = await Question.findByIdAndUpdate(
                        _id,
                        {
                            $inc: { dislikeCount: 1 },
                            $push: { dislikes: reqAccount._id },
                        },
                        { new: true }
                    )
                        .populate({ path: "account", select: "avatar fullname" })
                        .populate({ path: "tagIds", select: "name" });
                }
            }
            if (updatedQuestion) {
                return res.send({
                    result: "success",
                    question: updatedQuestion,
                });
            } else {
                return res.status(400).send({
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
