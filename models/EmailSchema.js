const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    }
})

const emailModel = mongoose.model('emails', EmailSchema)

module.exports = emailModel