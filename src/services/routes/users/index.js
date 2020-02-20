const express = require('express');
const router = express.Router();
const user = require('../../models/profiles/index');
const pdfGenerator = require("../../../pdf/pdfgenerator")
const path = require("path")
const json2csv = require("json2csv").parse
const fs = require("fs-extra")
const {ObjectId} = require('mongodb');
const {upload} = require('../../../middlewares/upload')

//USER
//GET all users
router.get('/', async (req, res) => {
    const results = await user.find({});
    console.log('Fetching data');
    res.send(results);
})

//GET user by id
router.get('/:id', async (req, res) => {
    const result = await user.findById(req.params.id);
    console.log('Fetching data by Id');
    res.send(result);
})

router.get('/me', async (req, res) => {
    try {
        const result = await user.find({ username: req.user.username });
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//POST user
router.post('/', async (req, res) => {
    try {
        const result = await user.create(req.body);
        console.log('Posting data');

        res.send(result);
    } catch (err) {

        res.send(err)
        console.log(err);
    }
})


//POST image for users Multer
router.post('/:username/picture',upload.single('profile'),async (req,res)=>{
    try {
        console.log(req.file)
        const request = await user.find({username:req.params.username});
        if (!request.length > 0)
            return res.status(404).send('POST NOT FOUND')
        if (!req.file)
            return res.status(500).send('select an image')

        let updateRequest = await user.findOneAndUpdate({
            username: req.params.username
        }, {
            image:req.file.url
        }, {
            new: true
        })

        res.send(updateRequest)

    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.put('/:id', async (req, res) => {
    try {
        console.log('editing data');
        delete req.body._id;
        const edited = await user.findByIdAndUpdate(req.params.id, {
            $set: {
                ...req.body
            }
        });
        if (edited) {
            res.send(edited);
        } else {
            res.status(404).send('user not found');
        }
    } catch (err) {
        console.log(err);
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await user.findByIdAndDelete(req.params.id);
        if (deleted) {
            res.send('Removed');
        } else {
            res.status(404).send('user not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('server error');
    }

    console.log('deleting data');
})

//Experience
//GET All experience from user
router.get('/:id/experience', async (req, res) => {
    const result = await user.findById(req.params.id);
    res.send(result.experience)
    console.log('Fetching all experience from a user');
})

//GET specific experience from user
router.get('/:id/experience/:expid', async (req, res) => {
    const singleExperience = await user.findOne({
        _id: new ObjectId(req.params.id),
        "experience._id": new ObjectId(req.params.expid)
    }, {
        "experience.$": 1
    })
    // const singleExperience = await user.findById(req.params.id, experience._id = req.params.expid)
    res.send(singleExperience);
    console.log('fetching 1 experience from a user')
})

//POST experience on user
router.post('/:id/experience', async (req, res) => {
    console.log('posting experience to a user');
    const newExperience = req.body
    try {
        const experience = await user.findByIdAndUpdate(req.params.id, {
            $push: {
                experience: newExperience
            }
        })
        res.send(experience);
    } catch (err) {
        res.status(500).send('server error');
    }
})

//EDIT specific experience on a specific user
router.patch('/:id/experience/:expid', async (req, res) => {
    try {
        const experience = await user.updateOne({
            _id: new ObjectId(req.params.id),
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": req.body
        })
        res.send('edited');
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    console.log('editing an experience from a user')
})


//DELETE a specific experience from a specific user
router.delete('/:id/experience/:expid', async (req, res) => {
    try {
        console.log('deleting an experience from a user');
        const toDelete = await user.findByIdAndUpdate(req.params.id, {
            $pull: {
                experience: {
                    _id: new ObjectId(req.params.expid)
                }
            }
        });
        res.send('Removed experience');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

/**
 * upload experience picture
 */
router.post('/:username/experience/:expid/picture',upload.single('experience'),async (req,res)=>{
    try {
        const request = await user.findOne({
            username:  req.params.username,
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
            username:  req.params.username,
            "experience._id": new ObjectId(req.params.expid)
        }, {
            "experience.$": newImage
        }, {new: true})
        res.send(experience);
    } catch (error) {
        res.status(500).send(error.message)
    }
})

//PDF
router.get('/:id/pdf', async (req, res) => {
    console.log('pdf');
    const response = await user.findById(req.params.id)
    await pdfGenerator(response)
    const file = path.join(__dirname, `../../pdf/${response._id}.pdf`);
    res.setHeader("Content-Disposition", `attachment; filename=${response._id}.pdf`);
    fs.createReadStream(file).pipe(res);
})



//CSV
router.get('/:id/csv', async (req, res) => {
    console.log('csv')
    const response = await user.findById(req.params.id)
    const fields = ["role", "company", "area"]
    const opts = {
        fields
    }
    try {
        let csv = json2csv(response.experience, opts)
        res.send(csv)
    } catch (err) {
        res.status(500).send(err)
    }
})





module.exports = router;