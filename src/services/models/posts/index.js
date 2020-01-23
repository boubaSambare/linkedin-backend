const {Schema ,model} = require('mongoose')
const comments = require('../comments')
const likes = require('../likes')

const postsShema = new Schema({
    text: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "http://lorempixel.com/400/200/"
    },
    commnets: [comments],
    likes: [likes]
}, {
    timestamps: true
})

const postsCollection = model('posts', postsShema)

module.exports = postsCollection