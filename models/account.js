const mongoose = require('mongoose');

const Account = new mongoose.Schema({
    fullname: String,
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: String,
    accountLevel: String,
    avatar: String,
    dob: String,
    gender: String,
    address: String,
    personalIdentificationNumber: String,
    accessToken: String,
    expirationDateToken: Date,
    resetPasswordToken: String,
    expirationDateResetPasswordToken: String,
})