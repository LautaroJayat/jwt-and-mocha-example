# Jason Web Token Login and Testing With Mocha Example

This is just a didactic example on how to test a JWT authentication system with Mocha and SuperTest

## Installing

* Download this repo and run **`npm install`**.

* Make a **`.env`** file in the root your cloned repo, and add `SECRET=yourSecret`, where *"yourSecret"* could be anything you want.


# Understanding what is happening

## Overview

First, take a look on how this repo is structured:

* We have our `app.js`, there we have setted up a simple server using Express and Dotenv for the enviroment variables.

    Note the following line: `module.exports = { app }`.

    That export will be usefull to expose the app and run our tests.

* We have a `.env` file that will be used by Dotenv to set our secret in our enviroment variables. That secret will be needed to encrypt our JWT

* There are a bunch of folders too:

    **Routes**: There it will be our routes and just our routes.

    **Models**: There it will be our Mongoose models with all it's asociated methods. This strategy is useful because it will help us to keep our controllers clean and avoid spagetti.

    **Controllers**: There it will be one file for each endpoint. Each file will be handling the functions using the models and schema methods, and also using some helpers as middlewares.

    **Helpers**: There it will be one file with two functions, one to retrive a user for the session when te JWT is legit. Another just to secure one route if the JWT ins't legit.

## The events in our logic
I strongly encourage you to look what is inside the files and folders mentioned above, so you could have an idea of how the logic is implemented.

### Register a new user

Here we have a simple process:

1. The request must have a 'content-type' header set to 'application/json'. We only allowing that. If it's not set, we return status code of 400.

2. They have to complete 'name', 'email, and 'password' fields. If not, we return 400.

3. The email and the name must be available. If not, we send another 400.

4. If everithing is ok, we send 200 and save the user.

### Login

Here the process is a little more tricky:

1. First we check if they are sending us a JWT. If we found one and is a good one, we can return the session info. If not, we hit `next()` and continue with the other handler.

2. There we will be checking if they are providing us everithing in the correct format, checking the 'content-type' header. If is not set to 'application/json', they an error status code.

3. If everithing is ok, we check if they are giving us the email and password. If they are missing, we send a bad request status code.

4. If they have send the email and password, we check if the password matches with our hashed password. if everything went OK, we make a new token and we send it in the 'x-auth' header. And they recive their session info with a 200 status code.

### Accessing a restricted resource

This is very similar to the login case:

1. We check if they are sending us a JWT in the headers. If not, we send an error.

2. We check if the token is valid. If not, we send an error.

3. If everithing went OK, we send the secret resource.

## The actual testing

Althougth we have seen what could be happening in every posible scenario of our authentication, that isn't what we actualy have to test. In fact, that only describes a little portion of the testing process. In reality we need also to do various other things.

To begin, we need to control our inputs to know what are we expecting as output. That is the function of the seeds. In the `/seed/seed.js` file we are seting up some user information and exporting some functions that will help us to:

* Know the name, email and passwords that we are using for the users.
* Use a brand new database for every test (our `saveUsers(done)` function)
* Generate a token for a user, as the provided in the login process (our `genToken()` function).
* Delete the token generated above to keep a clean database for the tests (our `cleanToken()` function).

To start, we set a `beforeEach(saveUsers)` function, so we can test using new database for every test. Then we set our 'describe' blocks with it's tests, and let's get ready to rumble!

Having all of that, we now must check the behavior of our routes. To do that, we use `supertest` module, wich will be used to make request's to our app routes.
If you look carefuly, you could understand whats is happening just using your intuition, because Mocha and Supertest are realy user frendly, write or read a test is almost like speak in english.

But, there are some cases where you could get lost. Let's se:

### The `done()` thing

If you see, every callback privded to the test has it's `done()` function. That is because in the design of Mocha they included a way to do **async** functions inside the tests. So, you provide this `done` thing as a parameter to your testing function and you call it at the end of the test.
This way, the test will wait until every function has finished and then will execute `done()` and trigger other internal functions to tell the framework that we can continue with the other tests.

### The `expect(res=>{})` thing

This syntax allows us to use what is inside the response object that our application returns. If you look closely, you will see that it help us to access things like the headers, body, etc. You can use a nested `expect()` to check what is going on in the response.

### The `request(app)` nested in the `getToken().then(()=>{})` thing

That thing is not a built-in feature of Mocha. This is just a workaround to be available to test how a token would work after a correct login. The fact is that we can't do a lot of requests and use their outputs of ones inside the input of the others. To solve this, we trigger the same functions that happens when a good login occurs, get the info and send it in the headers.
Althougth is true that this is like an indirect test, we could be sure that works if the previous and neccessary steps works fine.

### The `this.timeOut()` thing

This isn't the best practice, I know. But if you want see the behavior of an expired token, you must use an expired token. In this case, we changed our arrow functions --`()=>{}`-- to use the `function(){}` syntax in order to be able to acces the `this` keyword and the internal context. Having this, we can change the default timeOut of the function so it won't terminate the test in 2000ms and wait until we are done or at leas't 20 seconds.
After that, we make a token and use a `setTimeOut()` that make the token expires just to trigger the test only after this events happened.


# Conclutions?

Yes, we could conclude something.

First: this isn't a tutorial, is just a didactic example. If you are following this, you have to know that the best way to learn this kind of stuff is by reading documentations, examples and analyzing the code. This is just a guide for you to know what is the logic behind.

Second: testing requires a logic, because you need to know that one thing triggers the other, that you can reduce the cases and what they are implying. And mainly, you need to know that you are testing something and those tests PROVES that your code behavior as you want.

Third: testing requires creativity just like any other scientific activity. This is because there isn't just one way to do things, and because the tools that you are using are only tools. Is the tester who has to think and came with a solution on how to test everithing, in a secure, fast and cheap way. In fact, there are a lot of things that can't be directly tested with the tools and needs various tests that (by their logic implications) can show the actual behavior of the code.

Hope you find this useful!