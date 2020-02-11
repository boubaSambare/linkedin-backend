const {Router} = require('express')
const Auth = require('../models/auth')
const router = Router()

router.get("/", async (req, res) => {
    try {
        res.send(await Auth.find({}))
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/register", async (req, res) => {
    try {
        const user = await Auth.register(req.body, req.body.password)
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router