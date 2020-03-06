const User = require('../models/users');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (req.headers['content-type'] !== 'application/json') {
        res.status(400)
        return res.send('Must provide fields in application/json')
    }

    if (!name || !email || !password) {
        res.status(400)
        return res.send('Must provide name, email and password')
    }

    const user = new User({
        name, password, email
    })

    user.save()
        .then(() => { return user.generateAuthToken() })
        .then((token) => {
            res.setHeader('x-auth', `auth ${token}`)
            res.json(user);
            res.end()
        }).catch(err => {
            if (err.code === 11000) {
                return res.status(400).send('That name or email is allready in use')
            }
        })
}

module.exports = { register }
