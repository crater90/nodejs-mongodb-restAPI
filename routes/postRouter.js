const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

const auth = require('../middleware/auth');

//add a new post
router.post('/posts', auth, async (req, res) => {
    const { _id, title, desc } = req.body;
    if (!_id && !title) {
        res.status(400).json("userId and title are mandatory fields.")
    }
    const post = new Post({
        "userId": _id,
        title,
        desc
    })
    try {
        const savedPost = await post.save();
        res.status(200).json(savedPost);

    } catch (error) {
        res.status(500).json(error);
    }
})

//deleting a post 
router.delete('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body._id) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(error);
    }

})

//like a post
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body._id)) {
            await post.updateOne({ $push: { likes: req.body._id } });
            res.status(200).json("The post has been liked");
        } else {
            res.status(403).json("The post has already been liked");
        }
    } catch (err) {
        res.status(500).json(error);
    }
})

//dislike a post
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.includes(req.body._id)) {
            await post.updateOne({ $pull: { likes: req.body._id } });
            res.status(200).json("the post has been disliked");
        } else {
            res.status(403).json("the post has already been disliked");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})

//add a comment for a post with {id}
router.post('/comment/:id', auth, async (req, res) => {
    if (!req.body.comment) {
        res.status(400).json("please provide a comment");
    }
    try {
        const post = await Post.findById(req.params.id);
        post.comments.push({
            "userId": req.body._id,
            "comment": req.body.comment
        })
        const updated = await post.save();
        const updatedComment = updated.comments[updated.comments.length - 1];
        res.status(200).json({
            "commentId": updatedComment._id
        });

    } catch (error) {
        res.status(500).json(error);
    }
})

//get a no of likes and comments of a single post with {id} 
router.get('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json({
            "no_of_likes": post.likes.length,
            "comments": post.comments,
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

//get all post by the user
router.get('/all_posts', auth, async (req, res) => {
    try {
        const userPosts = await Post.find({ userId: req.body._id }).sort({ "createdAt": 1 });
        if (userPosts.length === 0) {
            res.status(400).json("No post found for this user");
        } else {
            const expectedResult = userPosts.map((post) => {
                return {
                    "id": post.userId,
                    "title": post.title,
                    "desc": post.desc,
                    "likes": post.likes.length,
                    "comments": post.comments,
                    "created_at": post.createdAt
                }
            })
            res.status(200).json(expectedResult);
        }

    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;