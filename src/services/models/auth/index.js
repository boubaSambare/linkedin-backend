const {Schema, model} = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const authSchema = new Schema({
    profile: {
        type: Schema.Types.ObjectId,
        ref: 'profiles'
    }

})

authSchema.plugin(passportLocalMongoose)

module.exports = model("userAuth", authSchema)