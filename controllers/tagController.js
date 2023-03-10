const account = require("../models/account");
const tag = require("../models/tag");

const tagController = {
    create: async (req, res) => {
        try {
            const { name, description } = req.body;
            // return console.log(req.body);
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
                return res.status(403).send({
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
        let { q } = req.query;
        q = q ?? "";
        page = parseInt(req.query.page) - 1;
        limit = parseInt(req.query.limit);
        let sortByCreateTime = parseInt(req.query.sortByCreateTime);
        try {
            var query = { name: { $regex: `.*${q}.*`, $options: "i" } };
            tag.find(query)
                .populate({ path: "account", select: "avatar fullname" })
                .sort({ createdAt: sortByCreateTime })
                .skip(page * limit) //Notice here
                .limit(limit)
                .exec((err, doc) => {
                    if (err) {
                        return res.json(err);
                    }
                    tag.countDocuments(query).exec((count_error, count) => {
                        if (err) {
                            return res.json(count_error);
                        }
                        return res.json({
                            count: count,
                            page: page + 1,
                            limit: limit,
                            tags: doc,
                        });
                    });
                });
        } catch (error) {
            res.send({
                result: "failed",
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { _id } = req.query;
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });

            const thisTag = await tag.findById(_id);

            if ((!reqAccount || !reqAccount._id.equals(thisTag.account)) && reqAccount.accountLevel !== "ADMIN") {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            await thisTag.delete();
            return res.status(200).json({
                result: "success",
            });
        } catch (error) {
            res.send({
                result: "failed",
                message: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const { name, description, _id } = req.body;
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await account.findOne({
                accessToken: accessToken,
            });
            const thisTag = await tag.findById(_id);

            const checkTag = await tag.findOne({
                name: name,
            });

            if (checkTag) {
                return res.status(404).send({
                    result: "failed",
                    message: "Tên đã tồn tại",
                });
            }

            if ((!reqAccount || !reqAccount._id.equals(thisTag.account)) && reqAccount.accountLevel !== "ADMIN") {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            tag.findOneAndUpdate(
                { _id: _id },
                {
                    $set: {
                        name: name,
                        description: description,
                    },
                },
                { new: true },
                (err, doc) => {
                    if (err) {
                        return res.send({
                            result: "failed",
                            message: err,
                        });
                    } else {
                        return res.status(200).json({
                            result: "success",
                            tag: doc,
                        });
                    }
                }
            );
        } catch (error) {
            res.send({
                result: "failed",
                message: error.message,
            });
        }
    },

    findPersonally: async (req, res) => {
        try {
            let { _id, q } = req.query;
            q = q ?? "";
            page = parseInt(req.query.page) - 1;
            limit = parseInt(req.query.limit);
            let sortByCreateTime = parseInt(req.query.sortByCreateTime);

            if (_id) {
                var query = { account: _id, name: { $regex: `.*${q}.*`, $options: "i" } };
                tag.find(query)
                    .populate({ path: "account", select: "avatar fullname" })
                    .sort({ createdAt: sortByCreateTime })
                    .skip(page * limit) //Notice here
                    .limit(limit)
                    .exec((err, doc) => {
                        if (err) {
                            return res.json(err);
                        }
                        tag.countDocuments(query).exec((count_error, count) => {
                            if (err) {
                                return res.json(count_error);
                            }
                            return res.json({
                                count: count,
                                page: page + 1 ?? 1,
                                limit: limit,
                                tags: doc,
                            });
                        });
                    });
            } else {
                const accessToken = req.headers.authorization.split(" ")[1];
                const reqAccount = await account.findOne({
                    accessToken: accessToken,
                });
                if (!reqAccount) {
                    return res.status(401).send({
                        result: "failed",
                        message: "Không có quyền thực thi",
                    });
                }
                var query = { account: reqAccount._id, title: { $regex: `.*${q}.*`, $options: "i" } };
                tag.find(query)
                    .populate({ path: "account", select: "avatar fullname" })
                    .sort({ createdAt: sortByCreateTime })
                    .skip(page * limit) //Notice here
                    .limit(limit)
                    .exec((err, doc) => {
                        if (err) {
                            return res.json(err);
                        }
                        tag.countDocuments(query).exec((count_error, count) => {
                            if (err) {
                                return res.json(count_error);
                            }
                            return res.json({
                                count: count,
                                page: page + 1 ?? 1,
                                limit: limit,
                                tags: doc,
                            });
                        });
                    });
            }
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    detail: async (req, res) => {
        try {
            const { tagId } = req.query;
            const tagDetail = await tag.findById(tagId);
            return res.status(200).json({
                result: "success",
                tag: tagDetail,
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
};

module.exports = tagController;
