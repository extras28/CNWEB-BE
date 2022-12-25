const Question = require("../models/question");
const account = require("../models/account");
const { isObjectEmpty } = require("../utils");
const { cloudinary } = require("../middlewares/uploadCloud");
const deleteImageCloud = require("../middlewares/deleteImageCloud");
// const account = require("../models/account")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const { title, contentTextProblem, contentTextExpect, tagIds } =
                req.body;
            // return console.log(tagIds);
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            if (!reqAccount) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            const newQuestion = new Question(
                {
                    title: title,
                    contentTextProblem: contentTextProblem,
                    contentTextExpect: contentTextExpect,
                    account: reqAccount._id,
                    contentImageProblem: {
                        path: req.files?.contentImageProblem[0]?.path,
                        filename: req.files?.contentImageProblem[0]?.filename,
                    },
                    contentImageExpect: {
                        path: req.files?.contentImageExpect[0]?.path,
                        filename: req.files?.contentImageExpect[0]?.filename,
                    },
                    like: 0,
                    dislike: 0,
                    numberOfView: 0,
                }
                // { $push: { tagIds: { $each: tagIds } } }
            );

            await newQuestion.save();
            return res.send({
                result: "success",
                question: newQuestion,
            });
        } catch (error) {
            deleteImageCloud([
                req.files?.contentImageProblem[0]?.filename,
                req.files?.contentImageExpect[0]?.filename,
            ]);
            res.send({
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
                .sort({ createdAt: sortByCreateTime })
                .skip(page * limit) //Notice here
                .limit(limit)
                .exec((err, doc) => {
                    if (err) {
                        return res.json(err);
                    }
                    Question.estimatedDocumentCount(query).exec(
                        (count_error, count) => {
                            if (err) {
                                return res.json(count_error);
                            }
                            return res.json({
                                total: count,
                                page: page + 1,
                                limit: limit,
                                questions: doc,
                            });
                        }
                    );
                });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
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
                return res.send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            await question.delete();
            return res.status(200).json({
                result: "success",
            });
        } catch (error) {
            res.status(404).json({
                result: "failed",
                message: error.message,
            });
        }
    },
};

module.exports = questionController;
