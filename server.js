const express = require('express');
const app = express();
const passport = require('passport')
const cors = require('cors')
const {join} = require('path')
const mongoose = require('mongoose');
const userServices = require('./src/services/routes/users/index');
const postRouter = require('./src/services/routes/posts')
const authRouter = require('./src/services/routes/auth')
const dotenv = require ('dotenv');
dotenv.config();
const auth = require('./src/middlewares/token-auth')

const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(passport.initialize())
app.use(cors())
app.use("/posts", express.static(join(__dirname, './public/posts/')))
app.use('/api/profiles',passport.authenticate('jwt'), userServices);
app.use('/api/posts',passport.authenticate('jwt'), postRouter)
app.use('/api/auth', authRouter)


app.listen(PORT ,()=>{
    console.log(`server active on port ${PORT}`);

const whitelist = ["http://localhost:5000",process.env.CORS_URL];
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};

mongoose.connect(process.env.MONGO_DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true
    })
    .then(db => {
            console.log('mongoose db is live')
        },
        err => console.log('mongoose db failed to connect', err))
})