const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../../services/models/auth')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

passport.use(new LocalStrategy(User.authenticate()))

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secret: process.env.TOKEN_SECRET
}

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, next) => {
    User.findById(jwtPayload._id, (err, user) => {
        if (err) return next(err, false) 
        else if (user) return next(null, user) 
        else return next(null, false) 
    })
}))


module.exports = {
    getToken: (user) => jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 3600 }) 
}