const {Schema, model} = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const authSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "YOUR EMAIL IS INVALID"]
    },
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'profiles'
    }

})

authSchema.plugin(passportLocalMongoose)

module.exports = model("userAuth", authSchema)