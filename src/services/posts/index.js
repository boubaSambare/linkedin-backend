const {
    Router
} = require('express')
const router = Router()
const posts = require('../models/posts')
const users = require('../models/users')
const multer = require('multer')
const {
    extname,
    join
} = require('path')

//Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, '../../../public/posts/'))
    },
    filename: (req, file, cb) => {
        cb(null, `${req.params.postId}${extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage
})

router.post('/:id/comment', async (req, res) => {
    try {
        const newComment = {
            ...req.body,
            post: req.params.id
        }
        const comment = await posts.findByIdAndUpdate(req.params.id, {
            $push: {
                comments: newComment
            }
        })
        res.send(comment.comments);
    } catch (error) {
        res.status(500).send(error);
    }
})
/**
 * Comments
 * Get all comments
 */
router.get('/:id/comment', async (req, res) => {
    try {
        const result = await posts.find({_id: req.params.id});
        res.send(result.comments)
    } catch (error) {
        res.status(500).send(error)
    }
})

/**
 * Posts 
 */
router.get("/", async (req, res) => {
    try {
        let request = await posts.find({})
        res.status(200).send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post("/", async (req, res) => {
    try {
        const request = await posts.create(req.body)
        request.save()
        res.send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/:username", async (req, res) => {
    try {
        let post = await posts.find({
            username: req.params.username
        })
        let user = await users.find({
            username: req.params.username
        })
        let response = [{
            user: user,
            posts: post
        }]
        res.status(200).send(response)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/:postId", async (req, res) => {
    try {
        let request = await posts.find({
            _id: req.params.postId
        })
        if (!request.length > 0)
            res.status(404).send('POST NOT FOUND')
        res.status(200).send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.put("/:postId", async (req, res) => {
    try {
        let request = await posts.findOneAndUpdate({
            _id: req.params.postId
        }, {
            ...req.body
        }, {
            new: true
        })
        res.send(request)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete("/:postId", async (req, res) => {
    try {
        let request = await posts.findByIdAndDelete(req.params.postId)
        res.send('DELETED')
    } catch (error) {
        res.status(500).send(error)
    }
})
/**
 * Multer
 * to upload picture
 */
router.post("/:postId", upload.single('posts'), async (req, res, next) => {
    try {
        let request = await posts.find({
            _id: req.params.postId
        })
        if (!request.length > 0)
            return res.status(404).send('POST NOT FOUND')
        if (!req.file)
            return res.status(500).send('select an image')

        let fileName = `${req.params.postId}${extname(req.file.originalname)}`
        let imageUrl = `${req.protocol}://${req.get('host')}/posts/${fileName}`
        req.body.image = imageUrl
        let updateRequest = await posts.findOneAndUpdate({
            _id: req.params.postId
        }, {
            ...req.body
        }, {
            new: true
        })

        res.send(updateRequest)

    } catch (error) {

    }
})





module.exports = router