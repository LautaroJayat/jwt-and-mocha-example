const mongoose = require('mongoose');
let db = process.env.NODE_ENV === 'test' ? 'test' : 'jwt';


mongoose.connect('mongodb://localhost:27017/' + db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(console.log('DB is connected to', db))
    .catch('Oops! There has been an error');
