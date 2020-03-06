require('dotenv').config()
const request = require('supertest');
const expect = require('expect');
const { app } = require('../app');
let { saveUsers, users, genToken, cleanToken } = require('./seed/seed');


beforeEach(saveUsers);

describe('GET "/"', () => {

    it('should return 200 status code', (done) => {
        request(app)
            .get('/')
            .expect(200)
            .end(done)

    })
})

describe('POST "/register"', () => {
    it('should return x-auth header and 200 after saving the model, containing 2 strings separated by space', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "name": users[1].name, "email": users[1].email, "password": users[1].password })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).not.toBe('undefined')
                expect(res.headers['x-auth'].split(' ').length).toBe(2)

            })
            .end(done)
    })

    it('should return 400 if you try to authenticate without email', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "name": users[1].name, "password": users[1].password })
            .expect(400)
            .end(done);
    })

    it('should return 400 if you try to authenticate without password', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "name": users[1].name, "email": users[1].email })
            .expect(400)
            .end(done);
    })

    it('should return 400 if you try to authenticate without name', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "password": users[1].password, "email": users[1].email })
            .expect(400)
            .end(done);
    })

    it('should return 400 if you try to sending other content-type but application/json', (done) => {
        request(app)
            .post('/register')
            .send('hi! with error!')
            .expect(400)
            .end(done);
    })

    it('should return 400 if you try to register a name that is allready in use', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "name": users[0].name, "email": users[1].email, "password": users[1].password })
            .expect(400)
            .end(done);
    })

    it('should return 400 if you try to register an email that is allready in use', (done) => {
        request(app)
            .post('/register')
            .set('content-type', 'application/json')
            .send({ "name": users[1].name, "email": users[0].email, "password": users[1].password })
            .expect(400)
            .end(done);
    })
});


describe('POST "/login"', () => {
    it('should return 400 when there is no name, email or password', (done) => {
        request(app)
            .post('/login')
            .set('content-type', 'application/json')
            .expect(400)
            .end(done)
    });


    it('should return 200 when content-type is application/json', (done) => {
        request(app)
            .post('/login')
            .set('content-type', 'application/json')
            .send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
            .expect(200)
            .end(done)
    })

    it('should return 401 when using bad email', (done) => {
        request(app)
            .post('/login')
            .set('content-type', 'application/json')
            .send({ "name": users[0].name, "email": "bad@email.com", "password": users[0].password })
            .expect(401)
            .end(done)
    })

    it('should contain x-auth header when the login is made with credentials', (done) => {
        request(app)
            .post('/login')
            .set('content-type', 'application/json')
            .send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
            .expect(200)
            .expect(res => {
                token = res.headers['x-auth'];
                expect(res.headers['x-auth']).not.toBe(undefined)
                expect(res.headers['x-auth']).not.toBe(null)
                expect(res.headers['x-auth'].split(' ').length).toBe(2)
                expect(res.headers['x-auth'].split(' ')[0].length < res.headers['x-auth'].split(' ')[1].length).toBe(true)

            })
            .end(done)
    })

    it('should not return an x-auth header when we try to login with one', (done) => {
        genToken()
            .then(token => {
                request(app)
                    .post('/login')
                    .set('content-type', 'application/json')
                    .set('x-auth', 'auth ' + token)
                    .send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
                    .expect(200)
                    .expect(res => {
                        expect(res.headers['x-auth']).toBe(undefined);


                    })
                    .end(done)
            })
            .finally(() => cleanToken())
            .catch((err) => console.log(err));


    })
    it('should return a json containing ONLY name and email fields when is everithing OK using only token', (done) => {
        genToken()
            .then(token => {
                request(app)
                    .post('/login')
                    .set('content-type', 'application/json')
                    .set('x-auth', 'auth ' + token)
                    .send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
                    .expect(200)
                    .expect(res => {
                        //console.log(res.body);
                        expect(res.headers['x-auth']).toBe(undefined);
                        expect(res.body).not.toBe(undefined);
                        expect(res.body._id).toBe(undefined)
                        expect(res.body.name).toBe(users[0].name);
                        expect(res.body.email).toBe(users[0].email);
                        expect(res.body.password).toBe(undefined);
                        expect(res.body.tokens).toBe(undefined);
                    })
                    .end(done)
            })
            .finally(() => cleanToken())
            .catch((err) => console.log(err));


    })

    it('should return a json containing ONLY name and email fields when everithing is OK using only credentials', (done) => {
        request(app)
            .post('/login')
            .set('content-type', 'application/json')
            .send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
            .expect(200)
            .expect(res => {
                //console.log(res.body);
                expect(res.headers['x-auth']).not.toBe(undefined);
                expect(res.body).not.toBe(undefined);
                expect(res.body._id).toBe(undefined)
                expect(res.body.name).toBe(users[0].name);
                expect(res.body.email).toBe(users[0].email);
                expect(res.body.password).toBe(undefined);
                expect(res.body.tokens).toBe(undefined);
            })
            .end(done)
    })
    it('should return 401 when using an expired token and no other info', function (done) {
        this.timeout(20000);

        genToken()
            .then(token => {
                setTimeout(() => {
                    request(app)
                        .get('/user/user-one')
                        .set('content-type', 'application/json')
                        .set('x-auth', 'auth ' + token)
                        //.send({ "name": users[0].name, "email": users[0].email, "password": users[0].password })
                        .expect(401)
                        .end(done)
                }, 12000);
            })
            .finally(() => cleanToken())
            .catch(err => console.log(err))

    })


})

describe('GET "/user/user-one"', () => {

    it('should return 401 when there is no token', (done) => {
        request(app)
            .get('/user/user-one')
            .set('content-type', 'application/json')
            .expect(401)
            .end(done)
    });

    it('should return 401 when there is a bad token', (done) => {
        request(app)
            .get('/user/user-one')
            .set('content-type', 'application/json')
            .set('x-auth', 'auth 123546897')
            .expect(401)
            .end(done)
    });

    it('should return 200 when providing a valid token', (done) => {
        genToken()
            .then(token => {
                request(app)
                    .get('/user/user-one')
                    .set('content-type', 'application/json')
                    .set('x-auth', 'auth ' + token)
                    .expect(200)
                    .end(done)
            })
            .finally(() => cleanToken())
            .catch(err => { console.log(error) })


    })
    it('should return 200 and a json with a secret when providing a valid token', (done) => {
        genToken()
            .then(token => {
                request(app)
                    .get('/user/user-one')
                    .set('content-type', 'application/json')
                    .set('x-auth', 'auth ' + token)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.secret).not.toBe(undefined)
                        expect(res.body.secret).toBe('Reached the private info')
                    })
                    .end(done)
            })
            .finally(() => cleanToken())
            .catch(err => { console.log(error) })

    })

    it('should return 401 when using an expired token', function (done) {
        this.timeout(20000);

        genToken()
            .then(token => {
                setTimeout(() => {
                    request(app)
                        .get('/user/user-one')
                        .set('content-type', 'application/json')
                        .set('x-auth', 'auth ' + token)
                        .expect(401)
                        .end(done)
                }, 12000);
            })
            .finally(() => cleanToken())
            .catch(err => console.log(err))
    });

})


