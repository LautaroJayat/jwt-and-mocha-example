const User = require('../models/users');

const privateInfo = (req, res) => {
    res.json({ secret: 'Reached the private info' });
    return res.end()

}

module.exports = { privateInfo }