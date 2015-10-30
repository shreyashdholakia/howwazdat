'use strict';

var mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  Statistics = mongoose.model('Statistics');


exports.tournamentStats = function (req, res) {
  var tournament = req.params.tournament;
  Statistics.findOne({tournament: tournament}, function (err, tournamentStats) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if (tournamentStats) {
      res.json({exists: true, data: tournamentStats});
    } else {
      res.json({exists: false});
    }
  });
};

exports.userStatistics = function (req,res) {
  var user = req.params.user;
  Statistics.find({'teams.player': user}, function (err, userStats) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if (userStats) {
      res.json({exists: true, data: userStats});
    } else {
      res.json({exists: false});
    }
  });

};
