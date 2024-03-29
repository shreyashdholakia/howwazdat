'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Profile = mongoose.model('UserProfile'),
  passport = require('passport'),
  ObjectId = mongoose.Types.ObjectId;

/**
 * Create user
 * requires: {username, password, email}
 * returns: {email, password}
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';

  newUser.save(function(err) {
    if (err) {
      return res.json(400, err);
    }

    req.logIn(newUser, function(err) {
      if (err) return next(err);
      return res.json(newUser.user_info);
    });
  });
};

exports.update = function (req, res, next) {
  var user = new User(req.body);
  console.log(user);
  newUser.provider = 'local';

  user.save(function(err) {
    if (err) {
      return res.json(400, err);
    } else {
      res.json(user);
    }
  });
};


/**
 *  Show profile
 *  returns {username, profile}
 */
exports.show = function (req, res, next) {
  var userId = req.params.userId;

  User.findById(ObjectId(userId), function (err, user) {
    if (err) {
      return next(new Error('Failed to load User'));
    }
    if (user) {
      res.send({username: user.username, profile: user.profile });
    } else {
      res.send(404, 'USER_NOT_FOUND')
    }
  });
};

/**
 *  Username exists
 *  returns {exists}
 */
exports.exists = function (req, res, next) {
  var username = req.params.username;
  User.findOne({ username : username }, function (err, user) {
    if (err) {
      return next(new Error('Failed to load User ' + username));
    }

    if(user) {
      res.json({exists: true});
    } else {
      res.json({exists: false});
    }
  });
}

exports.all = function (req, res) {
  Profile.find(function(err, users) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if(users) {
      res.json({exists: true, data: users});
    } else {
      res.json({exists: false});
    }
  });
};
