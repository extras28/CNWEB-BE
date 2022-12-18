const Question = require("../models/question")
// const account = require("../models/account")
const { isObjectEmpty } = require("../utils")
const { cloudinary } = require("../middlewares/uploadCloud")
const account = require("../models/account")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1]
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            })

            if (!reqAccount) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                })
            }

            const newQuestion = new Question({
                ...req.body,
                account: reqAccount._id,
                contentImageProblem: req.files.contentImageProblem[0].path,
                contentImageExpect: req.files.contentImageExpect[0].path,
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
        q = q ?? ""
        try {
            Question.find({
                title: { $regex: `.*${q}.*`, $options: "i" },
            })
                .populate({ path: "account", select: "avatar fullname" })
                .then((questions) => {
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
