const Question = require("../models/question")
const Account = require("../models/account")
const { isObjectEmpty } = require("../utils")
const { cloudinary } = require("../utils/cloudinary")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1]
            const question = req.body
            let contentImageProblem = ""
            let contentImageExpect = ""
            const account = await Account.findOne({
                accessToken: accessToken,
            })
            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                })
            }

            if (req.files) {
                if (req.files.contentImageProblem) {
                    let uploadcontentImageProblemResponse =
                        await cloudinary.uploader.upload(
                            req.files.contentImageProblem.tempFilePath,
                            {
                                upload_preset: "WebTechnology",
                            }
                        )
                    contentImageProblem =
                        uploadcontentImageProblemResponse.secure_url
                }
                if (req.files.contentImageExpect) {
                    let uploadcontentImageExpectResponse =
                        await cloudinary.uploader.upload(
                            req.files.contentImageExpect.tempFilePath,
                            {
                                upload_preset: "WebTechnology",
                            }
                        )
                    contentImageExpect =
                        uploadcontentImageExpectResponse.secure_url
                }
            }

            const newQuestion = new Question({
                ...question,
                account: account._id,
                contentImageProblem: contentImageProblem,
                contentImageExpect: contentImageExpect,
            })

            await newQuestion.save()
            return res.send({
                result: "success",
                question: newQuestion,
            })
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            })
        }
    },

    find: async (req, res) => {
        let { q, page, limit } = req.query
        q = q ?? "";
        try {
            Question.find({
                    title: { $regex: `.*${q}.*`, $options: "i" },
                })
                .populate({path: 'account', select: 'avatar fullname'}).then((questions)=>{
                    return res.send(questions)
                })
                // .skip(limit * page - limit)
                // .limit(limit)
                // .exec((err, questions) => {
                //     Question.countDocuments((err, count) => {
                //         if (err) {
                //             return res.send({
                //                 result: "failed",
                //                 message: err,
                //             })
                //         } else {
                //             return res.send({
                //                 result: "success",
                //                 questions: questions,
                //                 page: page,
                //                 limit: limit,
                //                 total: count,
                //             })
                //         }
                //     })
                // })
        } catch (error) {
            res.send({
                result: "failed",
                message: error,
            })
        }
    },
}

module.exports = questionController
