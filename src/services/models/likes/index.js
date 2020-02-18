const {Schema } = require('mongoose')

const likesShema = new Schema({
    username: {
        type: String,
        required: true
    },
    post: {
        type: Schema.Types.ObjectId
    }
}, {
    timestamps: true
})


module.exports = likesShema