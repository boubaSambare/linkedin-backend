const basicAuth = require('express-basic-auth')
const User = require('../../services/models/auth')
const atob = require('atob')

    checkUser = async (username, password, next) => {
        const {user} =  await User.authenticate()(username,password)
         next(null, user)
   
}

module.exports = {
    basic: basicAuth({
        authorizer: checkUser,
        authorizeAsync: true
    })
}