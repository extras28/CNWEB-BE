const Question = require("../models/question");
const account = require("../models/account");
const { isObjectEmpty } = require("../utils");
const { cloudinary } = require("../middlewares/uploadCloud");
// const account = require("../models/account")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            if (!reqAccount) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            const newQuestion = new Question({
                ...req.body,
                account: reqAccount._id,
                contentImageProblem: req.files?.contentImageProblem[0]?.path,
                contentImageExpect: req.files?.contentImageExpect[0]?.path,
                like: 0,
                dislike: 0,
                numberOfView: 0
            });

            await newQuestion.save();
            return res.send({
                result: "success",
                question: newQuestion,
            });
        } catch (error) {
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
                                limit: doc.length,
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
};

module.exports = questionController;
