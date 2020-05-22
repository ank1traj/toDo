var JwtStrategy = require('passport-jwt').Strategy;

var User = require('../app/models/user'); // load up the user model
var db   = require('../config/database'); // get db config file

module.exports = function(passport) {
    var opts = {};
    opts.secretOrKey = db.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({id: jwt_payload.id}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};