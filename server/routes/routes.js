const express = require("express");
const router = express.Router();
const API = require("../controllers/api");
const multer = require("multer");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

// multer middleware
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

let upload = multer({
    storage: storage
}).single('image');

router.get("/", API.fetchAllPost);


router.post('/register', async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    const result = await user.save()
    const {password, ...data} = await result.toJSON()
    res.send(data)
});

router.post('/login', async (req, res) => {

    const user = await User.findOne({email: req.body.email});

    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        })
    }

    const token = jwt.sign({_id: user._id}, "secret")
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    })
    res.send({
        message: 'success'
    })
})

router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'secret')
        if (!claims) {
            return res.status(401).send({
                message: 'authenticated'
            })
        }
        const user = await User.findOne({_id: claims._id})
        const {password, ...data} = await user.toJSON()

        res.send(data)
    } catch (e) {
        return res.status(401).send({
            message: 'authenticated'
        })
    }
})

router.post('/logout', (req, res) => {
    res.cookie('jwt', {maxAge: 0})
    res.send({
        message: 'success'
    })
})

router.get("/:id", API.fetchPostByID);
router.post("/", upload, API.createPost);
router.patch("/:id", upload, API.updatePost);
router.delete("/:id", API.deletePost);


module.exports = router;