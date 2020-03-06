require('dotenv').config()
const express = require('express');
const app = express();

//  Setting ports
const port = process.env.PORT || 3000;

// DB initializaiton
require('./database.js')

// Configurations
app.use(express.json())

//  Requiring Routes
app.use(require('./routes/users'))

// App init
app.listen(port, () => {
    console.log('Express listening on', 3000)
});


// Exporting to test
module.exports = { app };