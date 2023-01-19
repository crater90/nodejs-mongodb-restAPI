const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User')

const auth = require('../middleware/auth')

//registering a new user
router.post('/register', async (req, res) => {
    try {
        // Get user input
        const { username, email, password } = req.body;

        // Validate user input
        if (!(email && password && username)) {
            res.status(400).send("Please input necessary fields.");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.SECRET,
            {
                expiresIn: "1h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
})

//logging in or authenticating
router.post('/authenticate', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            res.status(400).send("All input is required");
        }
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            //creating token
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.SECRET,
                { expiresIn: "1h" }
            );

            //save user token
            user.token = token;

            // user
            res.status(200).json(user);
        } else {
            res.status(400).send("Invalid Credentials");
        }

    } catch (error) {
        console.log(error);
    }
})

//follow a user
router.post('/follow/:id', auth, async (req, res) => {
    if (req.body._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (!user.followers.includes(req.body._id)) {
                await user.updateOne({ $push: { followers: req.body._id } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You are already following this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't follow yourself");
    }
})

//unfollow a user
router.put('/unfollow/:id', auth, async (req, res) => {
    if (req.body._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (user.followers.includes(req.body._id)) {
                await user.updateOne({ $pull: { followers: req.body._id } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You do not follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't unfollow yourself");
    }
})

//get a user
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.body._id);
        res.status(200).json({
            "username": user.username,
            "no_of_followers": user.followers.length,
            "no_of_followings": user.followings.length
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;