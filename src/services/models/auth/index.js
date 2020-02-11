const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const authSchema = new mongoose.Schema({

})

authSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("userAuth", authSchema)