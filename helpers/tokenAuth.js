const User = require('../models/users');


const tokenAuth = async (req, res, next) => {
    if (req.header('x-auth')) {
       
        const providedToken = req.header('x-auth');

        try {
            const userByToken = await User.validateToken(providedToken);
            if (userByToken) {
                console.log('¿valid?')
                res.status(200)
                res.json({ name: userByToken.name, email: userByToken.email })
                return res.end();
            }
        }
        catch (err) {
            console.log(err)
        }
    }
    next()
}


const isAuth = async (req, res, next) => {
    if (req.header('x-auth')) {
        const providedToken = req.header('x-auth');

        try {
            const userByToken = await User.validateToken(providedToken);

            if (userByToken) {
                next()
            } else {
                return res.status(401).send('Must has the correct token, try login with email and password with POST /login')
            }
        }
        catch (err) {
            console.log(err)
            return res.status(401).send('Must has the correct token, try login with email and password with POST /login')

        }
    } else {
        return res.status(401).send('Must has the correct token, try login with email and password with POST /login')
    }

}


module.exports = { tokenAuth, isAuth }
