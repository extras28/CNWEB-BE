const answerController = {
    create: async (data) => {
        try {
            const {content, account} = data
            
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
};

module.exports = answerController;
