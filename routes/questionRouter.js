const express = require("express")
const questionController = require("../controllers/questionController")
const uploadCloud = require("../middlewares/uploadCloud")
const router = express.Router()

// create question
router.post(
    "/api/v1/question/create",
    uploadCloud.fields([
        {
            name: "contentImageProblem",
            maxCount: 1,
        },
        {
            name: "contentImageExpect",
            maxCount: 1,
        },
    ]),
    questionController.createQuestion
)

// get question
router.get("/api/v1/question/find", questionController.find)

module.exports = router
