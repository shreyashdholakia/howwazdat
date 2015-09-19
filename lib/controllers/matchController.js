'use strict';

var mongoose = require('mongoose'),
  Tournament = mongoose.model('Tournament'),
  Matches = mongoose.model('matches'),
  Team = mongoose.model('Teams');


exports.update = function(req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;

  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if(tournamentDetails) {
      tournamentDetails.matches = tournamentMatches;
      tournamentDetails.save(function (err) {});
    } else {
      res.json({exists: false});
    }
  });

  Team.findOne({'teamName': match.winningTeam }, function (err, teamDetails) {
       if (err) {
         return next(new Error('Failed to load tournament ' + match.winningTeam));
       }
       if(teamDetails) {
         teamDetails.won = teamDetails.won + 1;
         teamDetails.save(function (err) {});
       }
     });

  Matches.findOne({'matchNumber': match.matchNumber}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if(matchDetails) {
      matchDetails.toss = match.toss;
      matchDetails.winningTeam = match.winningTeam;
      matchDetails.mom = match.mom;
      matchDetails.tossDecision = match.tossDecision;
      matchDetails.status = match.status;
      matchDetails.homeTeamBatting = match.homeTeamBatting;
      matchDetails.visitingTeamBowling = match.visitingTeamBowling;
      matchDetails.visitingTeamBatting = match.visitingTeamBatting;
      matchDetails.homeTeamBowling = match.homeTeamBowling;
      matchDetails.save(function (err, done) {
        if (!err) {
          res.json({status: 'OK', data: matchDetails});
        } else {
          res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
        }
      });
    } else {
      res.json({exists: false});
    }
  });

}
