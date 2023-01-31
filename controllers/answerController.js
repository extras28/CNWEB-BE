const Answer = require("../models/answer");
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
            console.log(receivedAnswer);
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
        try {
            const receivedAnswer = JSON.parse(data);
            const { answer, accountId, reactType } = receivedAnswer;

            const thisAnswer = await Answer.findOne({ tempId: answer.tempId });

            const alreadyLike = thisAnswer.likes.includes(accountId);
            const alreadyDislike = thisAnswer.dislikes.includes(accountId);

            if (reactType === 1 && alreadyLike) {
                await Answer.findOneAndUpdate(
                    { tempId: answer.tempId },
                    {
                        $inc: { likeCount: -1 },
                        $pull: { likes: accountId },
                    }
                );
            } else if (reactType == 1 && !alreadyLike) {
                if (alreadyDislike) {
                    await Answer.findOneAndUpdate(
                        { tempId: answer.tempId },
                        {
                            $inc: { likeCount: 1, dislikeCount: -1 },
                            $push: { likes: accountId },
                            $pull: { dislikes: accountId },
                        }
                    );
                } else {
                    await Answer.findOneAndUpdate(
                        { tempId: answer.tempId },
                        {
                            $inc: { likeCount: 1 },
                            $push: { likes: accountId },
                        }
                    );
                }
            } else if (reactType == 0 && alreadyDislike) {
                await Answer.findOneAndUpdate(
                    { tempId: answer.tempId },
                    {
                        $inc: { dislikeCount: -1 },
                        $pull: { dislikes: accountId },
                    }
                );
            } else if (reactType == 0 && !alreadyDislike) {
                if (alreadyLike) {
                    await Answer.findOneAndUpdate(
                        { tempId: answer.tempId },
                        {
                            $inc: { likeCount: -1, dislikeCount: 1 },
                            $push: { dislikes: accountId },
                            $pull: { likes: accountId },
                        }
                    );
                } else {
                    await Answer.findOneAndUpdate(
                        { tempId: answer.tempId },
                        {
                            $inc: { dislikeCount: 1 },
                            $push: { dislikes: accountId },
                        }
                    );
                }
            }
        } catch (error) {
            console.log(`update answer error: ${error.message}`);
        }
    },
};

module.exports = answerController;
