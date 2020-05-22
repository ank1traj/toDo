var User = require('../app/models/user'); // get the mongoose model
var List = require('../app/models/list'); // get the mongoose model
var Note = require('../app/models/note'); // get the mongoose model
var db   = require('../config/database'); // get db config file

module.exports = function(apiRoutes, passport, jwt) {
    /*
     |--------------------------------------------------------------------------
     | AUTHENTICATION: POST COMMANDS
     |--------------------------------------------------------------------------
     |
     | /api/signup       - takes 2(name & password) parameters in a HTTP body
     | /api/authenticate - takes 2(name & password) parameters in a HTTP body
     */
    apiRoutes.post('/signup', function (req, res) {
        if (!req.body.name || !req.body.password) {
            res.json({success: false, msg: 'Please pass name and password.'});
        } else {
            var newUser = new User({
                name: req.body.name,
                password: req.body.password
            });
            // save the user
            newUser.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'Username already exists.'});
                }
                res.json({success: true, msg: 'Successfully created new user.'});
            });
        }
    });

    apiRoutes.post('/authenticate', function (req, res) {
        User.findOne({
            name: req.body.name
        }, function (err, user) {
            if (err) throw err;

            if (!user) {
                res.send({success: false, msg: 'Authentication failed.'});
            } else {
                // check if password matches
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        // if user is found and password is right create a token
                        var token = jwt.encode(user, db.secret);
                        // return the information including token as JSON
                        res.json({success: true, token: 'JWT ' + token});
                    } else {
                        res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                    }
                });
            }
        });
    });
    /*
     |--------------------------------------------------------------------------
     | LIST & NOTE: POST COMMANDS
     |--------------------------------------------------------------------------
     |
     | Every POST command takes a token in a HTTP header, to validate user.
     |
     | /api/list     - create a new list
     | /api/list/:id - create a new note within given list
     */
    apiRoutes.post('/list', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            var newList = new List({
                holder: user.name,
                name: req.body.name
            });

            newList.save(function(err) {
                if (err) {
                    return res.json({success: false, msg: 'Could not create a list.'});
                }
                res.json({success: true, msg: user.name + ', you succesfully created a new list.'});
            });
        });
    });

    apiRoutes.post('/list/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            var newNote = new Note({
                listId: Number(req.params.id),
                holder: user.name,
                name: req.body.name,
                priority: req.body.priority
            });

            newNote.save(function(err) {
                if (err) {
                    return res.json({success: false, msg: 'Could not create a note.'});
                }
                res.json({success: true, msg: user.name + ', you succesfully created a new note.'});
            });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | LIST & NOTE: GET COMMANDS
     |--------------------------------------------------------------------------
     |
     | Every GET command takes a token in a HTTP header, to validate user.
     |
     | /api/list     - get all lists
     | /api/list/:id - get all notes from a specific list
     | /api/note     - get all notes
     | /api/note/:id - get a specific note
     */
    apiRoutes.get('/list', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            db.fetch('lists', { holder : user.name }, function (data) {
                res.json(data);
            });
        });
    });

    apiRoutes.get('/list/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            db.fetch('notes', { holder : user.name,  listId: Number(req.params.id)  }, function (data) {
                res.json(data);
            });
        });
    });

    apiRoutes.get('/note', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            db.fetch('notes', { holder : user.name }, function (data) {
                res.json(data);
            });
        });
    });

    apiRoutes.get('/note/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            db.fetch('notes', { holder : user.name, noteId : Number(req.params.id) }, function (data) {
                res.json(data);
            });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | LIST & NOTE: PUT COMMANDS
     |--------------------------------------------------------------------------
     |
     | Every PUT command takes a token in a HTTP header, to validate user.
     |
     | /api/list/:id - able to rename a list
     | /api/note/:id - able to rename a note, marked as checked and change priority
     */
    apiRoutes.put('/list/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            var newInfo = req.body;
            db.update(
                'lists',
                { holder : user.name, listId : Number(req.params.id) },
                { name : newInfo.name },
                function (data) {
                    res.json({success: true, msg: user.name + ', you succesfully updated list nr. #' + req.params.id});
                });
        });
    });

    apiRoutes.put('/note/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            var newInfo = req.body;
            db.update(
                'notes',
                { holder : user.name, noteId : Number(req.params.id) },
                { name : newInfo.name, priority : Number(newInfo.priority), checked : Boolean(newInfo.checked)},
                function (data) {
                    res.json({success: true, msg: user.name + ', you succesfully updated note nr. #' + req.params.id});
                });
        });
    });

    /*
     |--------------------------------------------------------------------------
     | LIST & NOTE: DELETE COMMANDS
     |--------------------------------------------------------------------------
     |
     | Every DELETE command takes a token in a HTTP header, to validate user.
     |
     | /api/list/:id - delete a list and notes related to that list
     | /api/note/:id - delete a note
     */
    apiRoutes.delete('/list/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            // delete list
            db.remove(
                'lists',
                { holder : user.name, listId : Number(req.params.id) },
                function (data1) {
                    // Cannot get callback object
                    // delete notes related to that list
                    db.removeMany(
                        'notes',
                        { holder : user.name, listId : Number(req.params.id) },
                        function (data2) {
                            // Cannot get callback object
                            res.json({success: true, msg: user.name + ', you succesfully deleted a list '+
                            'Also all of the notes within the list were deleted.'});
                        });
                });
        });
    });

    apiRoutes.delete('/note/:id([0-9]+?)$', passport.authenticate('jwt', { session: false}), function (req, res) {
        var token = getToken(req.headers);
        verifyToken(token, function (user) {
            // delete list
            db.remove(
                'notes',
                { holder : user.name, noteId : Number(req.params.id) },
                function (data) {
                    res.json(data);
                });
        });
    });
    /*
     |--------------------------------------------------------------------------
     | FUNCTIONS
     |--------------------------------------------------------------------------
     |
     | getToken    - Retrieves a token from HTTP header and returns it
     | verifyToken - verifies if the given token is valid and callback the user
     */
    getToken = function (headers) {
        if (headers && headers.authorization) {
            var parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    verifyToken = function (token, callback) {
        if (token) {
            var decoded = jwt.decode(token, db.secret);
            User.findOne({
                name: decoded.name
            }, function(err, user) {
                if (err) throw err;

                if (!user) {
                    return res.status(403).send({success: false, msg: 'Authentication failed.'});
                } else {
                    callback(user);
                }
            });
        } else {
            return res.status(403).send({success: false, msg: 'No token provided.'});
        }
    };
}