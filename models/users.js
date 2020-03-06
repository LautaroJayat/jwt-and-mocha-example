const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        unique: true,
        validate: {
            validator: function (v) {
                return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v)
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    tokens: [{
        access: {
            type: String,
            required: true,
        },
        token: {
            type: String,
            required: true
        }
    }]

});

userSchema.methods.generateAuthToken = function () {
    let user = this;
    let access = 'auth';

    let token = jwt.sign({
        _id: user._id.toHexString(),
        access,
        exp: Math.floor(Date.now() / 1000) + 10//(60 * 60)
    },
        process.env.SECRET
    ).toString();

    user.tokens.push({ access, token })

    return user.save()
        .then(() => {
            return token
        })
        .catch((err) => console.log('There has been an error during the token generation\n', err));
}

userSchema.methods.comparePass = async function (password) {
    let user = this;
    return await bcrypt.compare(password, user.password);
}

userSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

userSchema.statics.getUserByEmail = function (email, password) {

    let User = this;

    return User.findOne({ email }, { tokens: 0 })
        .then(user => {

            if (!user) { return Promise.reject(new Error('Could not find with this email')); }

            return new Promise(async (resolve, reject) => {

                if (await user.comparePass(password)) {
                    user.tokens = [];
                    user.save()
                        .then(user => resolve(user))
                        .catch(err => console.log(err))
                } else {
                    reject(new Error('Could not authenticate user, bad credentials'));
                }
            })
        })

        .catch(err => {
            console.log(err)
            return
        })
}

userSchema.statics.validateToken = async function (providedToken) {
    let [access, token] = providedToken.split(' ');
    //console.log(access, token)

    let User = this;

    return new Promise(async (resolve, reject) => {


        User.findOne({ 'tokens.access': access, 'tokens.token': token }, { _id: 1, name: 1, email: 1 })

            .then(user => {

                if (user) {
                    jwt.verify(token, process.env.SECRET, { _id: user._id.toHexString() }, (err, decoded) => {

                        if (err) {
                            reject(err);
                            return
                        }
                        resolve(user)
                        return
                    });
                }

                else {
                    reject(new Error('Could not authenticate with bad token, lets try with credentials'));
                    return
                }

            }).catch(err => {
                reject(err);
                return
            })
    })

}



module.exports = model('User', userSchema);