const mongoose = require("mongoose");

const account = new mongoose.Schema(
    {
        fullname: String,
        teamId: String,
        email: {
            type: String,
            require: true,
            unique: true,
        },
        password: String,
        accountLevel: String,
        job: String,
        avatar: {
            path: String,
            filename: String,
        },
        dob: Date,
        phone: String,
        gender: String,
        address: String,
        accessToken: String,
        expirationDateToken: Date,
        resetPasswordToken: String,
        expirationDateResetPasswordToken: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("account", account);
