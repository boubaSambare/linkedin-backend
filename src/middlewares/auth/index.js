const basicAuth = require('express-basic-auth')
const User = require('../../services/models/auth')
const atob = require('atob')

const checkUser = async (username, password, cb) => {
    const {user} = await User.authenticate()(username,password)
    return cb(null, user)
}

module.exports = {
    basic: basicAuth({
        authorizer: checkUser,
        authorizeAsync: true
    })
}