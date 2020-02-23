const express = require('express');
const router = express.Router();
const user = require('../../models/profiles/index');
const pdfGenerator = require("../../../pdf/pdfgenerator")
const path = require("path")
const json2csv = require("json2csv").parse
const fs = require("fs-extra")
const { ObjectId } = require('mongodb');
const { upload } = require('../../../middlewares/upload')

//USER
//GET all users
router.get('/', async (req, res) => {
    const results = await user.find({});
    console.log('Fetching data');
    res.send(results);
})

//GET user by id


router.get('/me', async (req, res) => {
    try {
        const result = await user.find({ userName: req.user.username });
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//POST user
router.post('/', async (req, res) => {
    try {
        req.body.userName = req.user.username
        const result = await user.create(req.body);

        res.send(result);
    } catch (err) {

        res.send(err)
        console.log(err);
    }
})


//POST image for users Multer
router.post('/:username/picture', upload.single('profile'), async (req, res) => {
    try {
        console.log(req.file)
        const request = await user.find({ username: req.params.username });
        if (!request.length > 0)
            return res.status(404).send('POST NOT FOUND')
        if (!req.file)
            return res.status(500).send('select an image')

        let updateRequest = await user.findOneAndUpdate({
            username: req.params.username
        }, {
            image: req.file.url
        }, {
            new: true
        })

        res.send(updateRequest)

    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.put('/', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        delete req.body._id;
        const edited = await user.findOneAndUpdate({userName:req.user.username}, {
            $set: {
                ...req.body
            }
        },{new:true});
        if (edited) {
            res.send(edited);
        } else {
            res.status(404).send('user not found');
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.delete('/', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const deleted = await user.findOneAndDelete({userName:req.user.username},{new:true});
        if (deleted) {
            res.send(deleted);
        } else {
            res.status(404).send('user not found');
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//Experience
//GET All experience from user
router.get('/:username/experiences', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const result = await user.findOne({ userName: req.params.username });
        res.send(result.experience)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//GET specific experience from user
router.get('/:username/experience/:expid', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const singleExperience = await user.findOne({
            userName: req.user.username,
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": 1
        })
        res.send(singleExperience);
    } catch (error) {
        res.status(500).send(error.message)
    }

})

//POST experience on user
router.post('/:username/experiences', async (req, res) => {
    const newExperience = req.body
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const experience = await user.findOneAndUpdate({ userName: req.params.username }, {
            $push: {
                experience: newExperience
            }
        }, { new: true })
        res.send(experience);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

//EDIT specific experience on a specific user
router.patch('/:username/experience/:expid', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const experience = await user.updateOne({
            userName: req.params.username,
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": req.body
        })
        res.send(experience);
    } catch (error) {
        res.status(500).send(error.message);
    }
})


//DELETE a specific experience from a specific user
router.delete('/:username/experience/:expid', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const toDelete = await user.findOneAndUpdate({ userName: req.params.username }, {
            $pull: {
                experience: {
                    _id: new ObjectId(req.params.expid)
                }
            }
        }, { new: true });
        res.send(toDelete);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
})

/**
 * upload experience picture
 */
router.post('/:username/experience/:expid/picture', upload.single('experience'), async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const request = await user.findOne({
            username: req.params.username,
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": 1
        })
        if (!request.length > 0)
            return res.status(404).send('POST NOT FOUND')
        if (!req.file)
            return res.status(500).send('select an image')
        let newImage = {
            image: req.file.url
        }
        const experience = await user.findOneAndUpdate({
            username: req.params.username,
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": newImage
        }, { new: true })
        res.send(experience);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//PDF
router.get('/:username/pdf', async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const response = await user.findOne({ userName: req.params.username })
        await pdfGenerator(response)
        const file = path.join(__dirname, `../../pdf/${response._id}.pdf`);
        res.setHeader("Content-Disposition", `attachment; filename=${response._id}.pdf`);
        fs.createReadStream(file).pipe(res);
    } catch (error) {
        res.status(500).send(error.message)
    }

})



//CSV
router.get('/:username/csv', async (req, res) => {

    try {
        if (req.params.username !== req.user.username)
            throw new Error(`unauthorized please login or register with your username ${req.params.username}`)
        const response = await user.find({userName:req.params.username})
        const fields = ["role", "company", "area"]
        const opts = {
            fields
        }
        let csv = json2csv(response.experience, opts)
        res.send(csv)
    } catch (err) {
        res.status(500).send(err)
    }
})





module.exports = router;