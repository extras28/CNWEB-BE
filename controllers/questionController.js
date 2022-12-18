const Question = require("../models/question")
// const account = require("../models/account")
const { isObjectEmpty } = require("../utils")
const { cloudinary } = require("../middlewares/uploadCloud")
const account = require("../models/account")

const questionController = {
    createQuestion: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1]
            // const question = req.body
            //  console.log(req.body);
            //  console.log(req.files);
            //  return res.status(200).json(req.files)
            // let contentImageProblem = ""
            // let contentImageExpect = ""
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            })

            if (!reqAccount) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền truy cập",
                })
            }

            // if (req.files) {
            //     if (req.files.contentImageProblem) {
            // let uploadcontentImageProblemResponse =
            //     await cloudinary.uploader.upload(
            //         req.file.path,
            //         {
            //             upload_preset: "WebTechnology",
            //         }
            //     )
            //         contentImageProblem =
            //             uploadcontentImageProblemResponse.secure_url
            //     }
            //     if (req.files.contentImageExpect) {
            //         let uploadcontentImageExpectResponse =
            //             await cloudinary.uploader.upload(
            //                 req.files.contentImageExpect.tempFilePath,
            //                 {
            //                     upload_preset: "WebTechnology",
            //                 }
            //             )
            //         contentImageExpect =
            //             uploadcontentImageExpectResponse.secure_url
            //     }
            // }

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
