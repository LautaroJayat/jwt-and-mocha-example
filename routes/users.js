const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { tokenAuth, isAuth } = require('../helpers/tokenAuth');
const { register } = require('../controllers/register');
const { loginWithCredentials } = require('../controllers/login');
const { privateInfo } = require('../controllers/accessToPrivateInfo')


router.get('/', async (req, res) => {
    let users = await User.find({})
    console.log(users)
    res.send(users)
});

router.delete('/', async (req, res) => {
    await User.deleteMany({});
    res.send('working! "/ delete"')
});

router.post('/login', tokenAuth, loginWithCredentials)

router.post('/register', register)

router.get('/user/user-one', isAuth, privateInfo)

module.exports = router;