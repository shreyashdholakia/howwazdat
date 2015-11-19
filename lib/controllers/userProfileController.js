'use strict';

var mongoose = require('mongoose'),
  Profile = mongoose.model('UserProfile'),
  fs = require('fs');


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
  console.log(profile);
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
      var base64 = (user.avatar.data.toString('base64'));
      res.json({exists: true, data: user, image: base64});
    } else {
      res.json({exists: false});
    }
  });
};

exports.profilePicture = function (req, res, next) {
  var user = req.params.user;
  Profile.findOne({ email : user }, function (err, user) {
    if (req.files.file) {   // If the Image exists
      console.log(req.files.file);
      var fileName = req.files.file.originalFilename;
      var extension = fileName.substring(
        fileName.lastIndexOf('.') + 1).toLowerCase();
      if (extension == "png" || extension == "bmp"
        || extension == "jpeg" || extension == "jpg") {
          fs.readFile(req.files.file.path, function (dataErr, data) {
            if (data) {
              user.avatar.data = new Buffer(data, "base64");
              user.avatar.contentType = req.files.file.type;
              user.save(function (err, pic) {
                if (err) {
                  return next(new Error('Failed to load profile ' + email));
                } else {
                  var base64 = (pic.avatar.data.toString('base64'));
                  res.json({exists: true, data: pic, image: base64});
                }
              });
            }
          });
      } else {
        res.json({status: 'Error', message: "File was not of an acceptable type! Should be of (.jpg, .png, .bmp, .jpeg)"});
      }
    }
  });
};
