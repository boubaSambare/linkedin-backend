const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt')
const User = require('../../services/models/auth')
const ExtractJwt = require('passport')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
