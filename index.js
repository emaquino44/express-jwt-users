var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var secret = 'mysupersecretprobablyshouldbeavariable';
var User = require('./models/user');
var app = express();


mongoose.connect('mongodb://localhost:27017/myauthenticatedusers');

app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/api/users', require('./controllers/users'));

//Middleware to check for tokens

app.use('/api/users',
    expressJWT({ secret: secret }).unless({ method: 'POST' }),
    require('./controllers/users')
);
//Error handler to handle unauthorized users gracefully -otherwise it's long and ugly!

app.use(function(err, req, res, next) {
    //Catch unauthorized errors, send status/msg that is cleaner than the default
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({ message: 'You need an authorization token to view this page.' });
    }
});
//A route to generate tokens
//TO DO!
app.post('/api/auth', function(req, res) {
    //Find the user, check their creditials
    //Select any info about that user that we want to include as part of the token's payload
    User.findOne({ email: req.body.email }, function(err, user) {
        if (err || !user) {
            return res.send("User not found!");
        }
        user.authenticated(req.body.password, function(err, result) {
            if (err || !result) {
                return res.send('Invalid Credentials');
            }
            //Yay, things are working. I'm finally ready to make JWT!
            var token = jwt.sign(user, secret);
            //How I have a token, I just need to send it back tot he user in JSON format
            res.send({ user: user, token: token });
            //Create a form with email and password field
        });
    });
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.listen(3000);
