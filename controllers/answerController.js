const answer = require("../models/answer");
const question = require("../models/question");

const answerController = {
    create: async (data) => {
        try {
            const receivedAnswer = JSON.parse(data);
            const newAnser = await answer.create({
                tempId: receivedAnswer.answer.tempId,
                account: receivedAnswer.answer.account._id,
                content: receivedAnswer.answer.content,
            });
            await question.findByIdAndUpdate(
                receivedAnswer.answer.questionId,
                { $push: { answer: newAnser._id } },
                { new: true }
            );
        } catch (error) {
            console.log(`create answer error: ${error.message}`);
        }
    },

    update: async (data) => {
        try {
            const receivedAnswer = JSON.parse(data);
            if (receivedAnswer.answer.tempId) {
                await answer.findOneAndUpdate(
                    { tempId: receivedAnswer.answer.tempId },
                    {
                        content: receivedAnswer.answer.content,
                    }
                );
            } else {
                await answer.findByIdAndUpdate(receivedAnswer.answer._id, { content: receivedAnswer.answer.content });
            }
        } catch (error) {
            console.log(`update answer error: ${error.message}`);
        }
    },

    delete: async (data) => {
        try {
            const receivedAnswer = JSON.parse(data);
            if (receivedAnswer.answer.tempId) {
                await answer.findOneAndDelete({ tempId: receivedAnswer.answer.tempId });
            } else {
                await answer.findByIdAndDelete(receivedAnswer.answer._id);
            }
        } catch (error) {
            console.log(`delete answer error: ${error.message}`);
        }
    },

    react: async (data) => {
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
    },
};

module.exports = answerController;
