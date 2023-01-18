require('dotenv').config()

const userRouter = require('./routes/userRouter');
const postRouter = require('./routes/postRouter');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

app.listen(5000, () => {
    console.log('server started at 5000');
})

mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Successfully connected to database");
    })
    .catch((error) => {
        console.log("database connection failed. exiting now...");
        console.error(error);
    });

app.use(express.json());
app.use('/api', userRouter);
app.use('/api', postRouter);