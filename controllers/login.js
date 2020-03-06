const User = require('../models/users');

const loginWithCredentials = async (req, res) => {

    let { password, email } = req.body;

    if (req.headers['content-type'] !== 'application/json') {
        res.status(400)
        return res.send('Content-type must be "application/json"');
    }

    if (!password || !email) {
        res.status(400);
        return res.send('You must provide Name, password and email');
    }

    try {

        let user = await User.getUserByEmail(email, password);

        if (user) {
            user.generateAuthToken();
            res.status(200).setHeader('x-auth', `${user.tokens[0].access} ${user.tokens[0].token}`)
            res.json({ name: user.name, email: user.email });
            return res.end()
        }

        else {
            return res.status(401).send('could not authenticate')
        }

    } catch (err) {
        //console.log(err);
        return res.status(401).send('could not authenticate')
    }
}
module.exports = { loginWithCredentials }