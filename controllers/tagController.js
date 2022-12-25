const account = require("../models/account");
const tag = require("../models/tag");

const tagController = {
    create: async (req, res) => {
        try {
            const { name, description } = req.body;
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            const checkTag = await tag.findOne({
                name: name,
            });

            if (checkTag) {
                return res.status(404).send({
                    result: "failed",
                    message: "Tên đã tồn tại",
                });
            }

            if (!reqAccount) {
                return res.send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            const newTag = new tag({
                name: name,
                description: description,
                numberOfQuestion: 0,
                questionPerWeek: 0,
                questionThisDay: 0,
                account: reqAccount._id,
            });

            await newTag.save();

            return res.status(200).send({
                result: "success",
                tag: newTag,
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error.message,
            });
        }
    },

    find: async (req, res) => {
        try {
            
        } catch (error) {
            
        }
    }
};

module.exports = tagController;
