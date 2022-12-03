const Question = require("../models/question");
const Account = require("../models/account");
const {
    isObjectEmpty
} = require("../utils");
const {
    cloudinary
} = require("../utils/cloudinary");

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const question = req.body;
            let contentImageProblem = "";
            let contentImageExpect = "";
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                });
            }

            if (req.files) {
                if (req.files.contentImageProblem) {
                    let uploadcontentImageProblemResponse =
                        await cloudinary.uploader.upload(
                            req.files.contentImageProblem.tempFilePath, {
                                upload_preset: "WebTechnology",
                            }
                        );
                    contentImageProblem = uploadcontentImageProblemResponse.secure_url;
                }
                if (req.files.contentImageExpect) {
                    let uploadcontentImageExpectResponse =
                        await cloudinary.uploader.upload(
                            req.files.contentImageExpect.tempFilePath, {
                                upload_preset: "WebTechnology",
                            }
                        );
                    contentImageExpect = uploadcontentImageExpectResponse.secure_url;
                }
            }

            const newQuestion = new Question({
                ...question,
                accountId: account._id,
                contentImageProblem: contentImageProblem,
                contentImageExpect: contentImageExpect,
            });

            await newQuestion.save();
            return res.send({
                result: "success",
                question: newQuestion,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            });
        }
    },

    find: async (req, res) => {
        const {
            q,
            page,
            limit
        } = req.query;
        try {
            Question.find({
                    title:{$regex: '.*' + q + '.*'},
                    contentTextProblem: {$regex: '.*' + q + '.*'},
                    contentTextExpect: {$regex: '.*' + q + '.*'},
                })
                .skip(limit * page - limit)
                .limit(limit)
                .exec((err, questions) => {
                    Question.countDocuments((err, count) => {
                        if (err) {
                            return res.send({
                                result: "failed",
                                message: err,
                            });
                        } else {
                            return res.send({
                                result: "success",
                                questions: questions,
                            });
                        }
                    });
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
