const answer = require("../models/answer");
const question = require("../models/question");

const answerController = {
    create: async (data) => {
        try {
            const receivedAnswer = JSON.parse(data);
            console.log(receivedAnswer);
            const newAnser = await answer.create({
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
};

module.exports = answerController;
