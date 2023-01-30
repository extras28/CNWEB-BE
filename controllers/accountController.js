const Account = require("../models/account");
const { generateRandomStr, sha256 } = require("../utils");
const utils = require("../utils");
const moment = require("moment");
const sendEmail = require("../utils/nodeMailer");
const deleteImageCloud = require("../middlewares/deleteImageCloud");

const accountController = {
    signUp: async (req, res) => {
        try {
            //check Account existent
            let account = await Account.findOne({
                email: req.body.email,
            });

            if (account) {
                return res.send({
                    result: "failed",
                    message: "Tài khoản đã tồn tại",
                });
            }

            const hashed = await utils.sha256(req.body.password);

            const newAccount = new Account({
                fullname: req.body.fullname,
                email: req.body.email,
                password: hashed,
                accessToken: "",
                expirationDateToken: null,
                gender: req.body.gender,
                dob: req.body.dob,
                avatar: "",
                address: "",
                phone: "",
                job: req.body.job,
                accountLevel: "USER",
            });

            await newAccount.save();
            newAccount.toJSON = function () {
                var obj = this.toObject();
                delete obj.password;
                return obj;
            };

            return res.send({
                result: "success",
                account: newAccount,
            });
        } catch (err) {
            res.status(500).send({
                result: "failed",
                message: err,
            });
        }
    },
    signIn: async (req, res) => {
        try {
            const account = await Account.findOne({
                email: req.body.email,
            });

            if (!account) {
                return res.status(404).json({
                    result: "success",
                    message: "Email không đúng",
                });
            }

            const hashed = await utils.sha256(req.body.password);
            const validPassword = hashed === account.password;

            if (!validPassword) {
                return res.status(404).json({
                    result: "failed",
                    message: "Sai mật khẩu",
                });
            }

            if (!account.accessToken || moment(account.expirationDateToken).diff(moment.now()) < 0) {
                var accessToken = generateRandomStr(32);
                var expirationDate = new Date();
                var time = expirationDate.getTime();
                var time1 = time + 24 * 3600 * 1000;
                var setTime = expirationDate.setTime(time1);
                var expirationDateStr = moment(setTime).format("YYYY-MM-DD HH:mm:ss").toString();

                await account.updateOne({
                    accessToken: accessToken,
                    expirationDateToken: expirationDateStr,
                });
            }
            const responseAccount = await Account.findOne(
                {
                    _id: account._id,
                },
                { password: 0 }
            );

            responseAccount.toJSON = function () {
                var obj = this.toObject();
                delete obj.password;
                return obj;
            };

            return res.send({
                result: "success",
                account: responseAccount,
            });
        } catch (err) {
            res.status(500).json({
                result: "failed",
                error: err,
            });
        }
    },
    signOut: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            await account.updateOne({
                accessToken: null,
                expirationDateToken: null,
            });

            const responseAccount = await Account.findOne({
                _id: account._id,
            });
            res.send({
                result: "success",
            });
        } catch (error) {
            res.status(500).send({
                result: "failed",
                reason: error.message,
            });
        }
    },
    requestToResetPassword: async (req, res) => {
        try {
            let { email } = req.body;

            let account = await Account.findOne({
                email: email,
            });

            if (!account) {
                return res.send({
                    result: "failed",
                    message: "email không hợp lệ",
                });
            }
            var random = 100000 + Math.random() * 900000;
            var plainResetPasswordToken = Math.floor(random);

            const hashedResetPasswordToken = await utils.sha256(plainResetPasswordToken.toString());

            const newPassword = await utils.sha256(hashedResetPasswordToken);

            await Account.findOneAndUpdate(
                {
                    email: email,
                },
                {
                    password: newPassword,
                }
            );

            res.send({
                result: "success",
            });
            await sendEmail(
                email,
                "CodeHelper your reset password code",
                `Your new password: ${plainResetPasswordToken}`
            );
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
    resetPassword: async (req, res) => {
        try {
            let { email, resetPasswordToken, newPassword } = req.body;

            let account = await Account.findOne({
                email: email,
            });

            const hashedResetPasswordToken = utils.sha256(resetPasswordToken);

            const hashedPassword = utils.sha256(newPassword);

            if (!account) {
                return res.send({
                    result: "failed",
                    message: "Đổi mật khẩu không thành công",
                });
            }

            if (account.resetPasswordToken === hashedResetPasswordToken) {
                await Account.findOneAndUpdate(
                    {
                        email: email,
                    },
                    {
                        resetPasswordToken: null,
                        expirationDateResetPasswordToken: null,
                        password: hashedPassword,
                    }
                );
                return res.send({
                    result: "success",
                    message: "Thay đổi mật khẩu thành công",
                });
            }
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
    changePassword: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            const account = await Account.findOne({
                accessToken: accessToken,
            });
            const password = await sha256(req.body.password);
            const newPassword = await sha256(req.body.newPassword);

            if (account) {
                if (password === account.password) {
                    await Account.findByIdAndUpdate(account.id, {
                        password: newPassword,
                    });
                    return res.send({
                        result: "success",
                        message: "Đổi mật khẩu thành công",
                    });
                }
                return res.send({
                    result: "failed",
                    message: "Mật khẩu cũ không chính xác",
                });
            }
            return res.send({
                result: "faled",
                message: "Sai email",
            });
        } catch (err) {
            res.send({
                result: "faled",
                message: err,
            });
        }
    },

    find: async (req, res) => {
        let { q } = req.query;
        q = q ?? "";
        page = parseInt(req.query.page) - 1;
        limit = parseInt(req.query.limit);
        try {
            var query = {
                accountLevel: "USER",
                $or: [
                    {
                        fullname: {
                            $regex: `.*${q}.*`,
                            $options: "i",
                        },
                    },
                    {
                        email: {
                            $regex: `.*${q}.*`,
                            $options: "i",
                        },
                    },
                ],
            };
            Account.find(query, { password: 0 })
                .sort({ update_at: -1 })
                .skip(page * limit) //Notice here
                .limit(limit)
                .exec((err, doc) => {
                    if (err) {
                        return res.json(err);
                    }
                    Account.countDocuments(query).exec((count_error, count) => {
                        if (err) {
                            return res.json(count_error);
                        }
                        return res.json({
                            result: "success",
                            count: count,
                            page: page + 1,
                            limit: limit,
                            accounts: doc,
                            total: doc.length,
                        });
                    });
                });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            console.log(req.body);
            let account;
            if (req.body._id) {
                account = await Account.findById(req.body._id);
            } else {
                account = await Account.findOne({
                    accessToken: accessToken,
                });
            }
            if (!account && account.accountLevel !== "ADMIN") {
                return res.status(403).json({
                    result: "failed",
                    message: "Không đủ quyền truy cập",
                });
            }
            let updatedAccount;
            if (req.file) {
                updatedAccount = await Account.findByIdAndUpdate(
                    account._id,
                    {
                        ...req.body,
                        avatar: {
                            path: req.file.path,
                            filename: req.file.filename,
                        },
                    },
                    { new: true }
                );
            } else {
                updatedAccount = await Account.findByIdAndUpdate(
                    account._id,
                    {
                        ...req.body,
                    },
                    { new: true }
                );
            }

            updatedAccount.toJSON = function () {
                var obj = this.toObject();
                delete obj.password;
                return obj;
            };

            return res.status(200).json({
                result: "success",
                account: updatedAccount,
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    detail: async (req, res) => {
        try {
            const accessToken = req.headers.authorization.split(" ")[1];
            let account;
            if (req.query._id) {
                account = await Account.findOne({
                    _id: req.query._id,
                });
            } else {
                account = await Account.findOne({
                    accessToken: accessToken,
                });
            }

            if (!account && account.accountLevel !== "ADMIN") {
                return res.status(403).json({
                    result: "failed",
                    message: "Không đủ quyền truy cập",
                });
            }

            account.toJSON = function () {
                var obj = this.toObject();
                delete obj.password;
                return obj;
            };

            res.status(200).json({
                result: "success",
                account: account,
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { _id } = req.query;
            const accessToken = req.headers.authorization.split(" ")[1];
            const reqAccount = await Account.findOne({
                accessToken: accessToken,
            });

            const account = await Account.findById(_id);

            if (reqAccount.accountLevel !== "ADMIN") {
                return res.status(403).send({
                    result: "failed",
                    message: "Không có quyền thực thi",
                });
            }

            await account.delete();
            return res.status(200).json({
                result: "success",
            });
        } catch (error) {
            res.status(400).send({
                result: "failed",
                message: error.message,
            });
        }
    },
};

module.exports = accountController;
