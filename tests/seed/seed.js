const User = require('../../models/users')
const { ObjectID } = require('mongodb');

const users = [{
    _id: new ObjectID(),
    name: 'User One',
    email: 'userOne@gmail.com',
    password: '123456789',
}
    ,
{
    _id: new ObjectID(),
    name: 'User Two',
    email: 'userTwo@gmail.com',
    password: '987654321',
}];

let token

async function genToken() {
    const user = await User.findOne({ email: users[0].email });
    token = await user.generateAuthToken()
    console.log('New token for user[0] was created!');
    return token
}

function cleanToken() {
    token = undefined;
    return console.log("Seed's token variable is now", undefined)
}

const saveUsers = (done) => {
    User.deleteMany({}).then(() => {
        let userOne = new User(users[0]).save()
        return Promise.all([userOne  /*in case that you wanted to provide more users to test*/]);

    }).then(() => {
        console.log('Database is ready!')
        done()
    });

}



module.exports = {
    saveUsers,
    users,
    genToken,
    cleanToken
}