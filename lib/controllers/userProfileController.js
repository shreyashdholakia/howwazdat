'use strict';

var mongoose = require('mongoose'),
  Profile = mongoose.model('UserProfile');


/**
 * Create user profile
 */
exports.create = function(req, res) {
  var profile = new Profile(req.body.user);

  profile.save(function(err) {
    if (err) {
      res.json(500, err);
    } else {
      res.json({exists: true, data: profile});
    }
  });
};


exports.update = function(req, res) {
  var profile = new Profile(req.body.user);

  Profile.findOne({ 'username': profile.username }, function (err, oldProfile) {
      oldProfile.firstname = profile.firstname;
      oldProfile.lastname = profile.lastname;
      oldProfile.location = profile.location;
      oldProfile.save(function (err, done) {
          if (!err) {
             res.json({status: 'OK', data: oldProfile});
          } else {
             res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
          }
      });
  });
};

exports.userDetails = function(req, res, next) {
  var email = req.params.username;
  Profile.findOne({ email : email }, function (err, user) {
    if (err) {
      return next(new Error('Failed to load profile ' + email));
    }
    if(user) {
      res.json({exists: true, data: user});
    } else {
      res.json({exists: false});
    }
  });
};
