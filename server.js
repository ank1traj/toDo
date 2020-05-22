(function () {
    /*--------------------------------------------------------------------------
     | SET UP
     |--------------------------------------------------------------------------*/
    var express = require('express'); // web framework
    var app = express();
    var cors = require('cors');
    var db = require('./config/database'); // get db db file
    var mongoose = require('mongoose');  // mongoose to create our database schemas
    var jwt = require('jwt-simple'); // web tokens
    var path = require('path');
    var port = process.env.PORT || 8080;
// Extra
    var bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware before your handlers
    var morgan = require('morgan'); // HTTP request logger middleware
    var passport = require('passport');  // use passport to secure our login


    /*--------------------------------------------------------------------------
     | CONFIGURATION
     |--------------------------------------------------------------------------*/

// connect to database
    mongoose.connect(db.database);

    // access public folder
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/scripts', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/')));
    app.use('/angular', express.static(path.join(__dirname, '/node_modules/angular/')));
    app.use('/angular-route', express.static(path.join(__dirname, '/node_modules/angular-route/')));

// get our request parameters
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

// log to console
    app.use(morgan('dev'));

// bundle our routes
    var apiRoutes = express.Router();

// connect the api routes under /api/*
    app.use('/api', apiRoutes);

// Use the passport package in our application
    app.use(passport.initialize());

// pass passport for configuration
    require('./config/passport')(passport);

    apiRoutes.use(cors());

    /*--------------------------------------------------------------------------
     | ROUTES
     |--------------------------------------------------------------------------*/
    require('./app/routes.js')(apiRoutes, passport, jwt);


    /*--------------------------------------------------------------------------
     | LISTEN
     |--------------------------------------------------------------------------*/

// Start the server
    app.listen(port);
    console.log('No mans land: http://localhost:' + port);
}());