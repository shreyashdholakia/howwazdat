'use strict';

var mongoose = require('mongoose'),
  Tournament = mongoose.model('Tournament'),
  Matches = mongoose.model('matches'),
  Team = mongoose.model('Teams'),
  Points = mongoose.model('PointsTable');


exports.update = function (req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;
  var matchArr = [];
  var stats = [];

  matchArr.push({
    tournament: tournament,
    matchNumber: match.matchNumber
  });

  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (tournamentDetails) {
      tournamentDetails.matches = tournamentMatches;
      tournamentDetails.save(function (err) {
      });
    } else {
      res.json({exists: false});
    }
  });

  if (match.scoreCard == 'changed') {
    Points.findOne({'tournament': tournament}, function (err, points) {
      if (points) {
        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
          $inc: {
            'teamStats.$.points': 2,
            'teamStats.$.won': 1,
            'teamStats.$.lost': -1
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.losingTeam}]}, {
          $inc: {
            'teamStats.$.points': -2,
            'teamStats.$.won': -1,
            'teamStats.$.lost': 1
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

      }
    });

    Team.findOne({'teamName': match.winningTeam}, function (err, teamDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + match.winningTeam));
      }
      if (teamDetails) {
        teamDetails.won.push({
          tournament: tournament,
          matchNumber: match.matchNumber
        });

        var index = teamDetails.lost.indexOf(matchArr);
        teamDetails.lost.splice(index, 1);

        teamDetails.save(function (err) {
        });
      }
    });

    Team.findOne({'teamName': match.losingTeam}, function (err, teamDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + match.winningTeam));
      }
      if (teamDetails) {
        teamDetails.lost.push({
          tournament: tournament,
          matchNumber: match.matchNumber
        });


        var index = teamDetails.won.indexOf(matchArr);
        teamDetails.won.splice(index, 1);

        teamDetails.save(function (err) {
        });
      }
    });
  } else if (match.scoreCard == 'new') {

    Points.findOne({'tournament': tournament}, function (err, points) {
      if (points) {
        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
          $inc: {
            'teamStats.$.points': 2,
            'teamStats.$.won': 1,
            'teamStats.$.lost': 0,
            'teamStats.$.games' : 1
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.losingTeam}]}, {
          $inc: {
            'teamStats.$.points': 0,
            'teamStats.$.won': 0,
            'teamStats.$.lost': 1,
            'teamStats.$.games' : 1
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

      }
    });

    Team.findOne({'teamName': match.winningTeam}, function (err, teamDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + match.winningTeam));
      }
      if (teamDetails) {
        teamDetails.won.push({
          tournament: tournament,
          matchNumber: match.matchNumber
        });
        teamDetails.save(function (err) {
        });
      }
    });

    Team.findOne({'teamName': match.losingTeam}, function (err, teamDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + match.winningTeam));
      }
      if (teamDetails) {
        teamDetails.lost.push({
          tournament: tournament,
          matchNumber: match.matchNumber
        });
        teamDetails.save(function (err) {
        });
      }
    });
  }

  Matches.findOne({'matchNumber': match.matchNumber}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (matchDetails) {
      matchDetails.toss = match.toss;
      matchDetails.winningTeam = match.winningTeam;
      matchDetails.mom = match.mom;
      matchDetails.tossDecision = match.tossDecision;
      matchDetails.status = match.status;
      matchDetails.homeTeamBatting = match.homeTeamBatting;
      matchDetails.visitingTeamBowling = match.visitingTeamBowling;
      matchDetails.visitingTeamBatting = match.visitingTeamBatting;
      matchDetails.homeTeamBowling = match.homeTeamBowling;
      matchDetails.homeTeamTotal = match.homeTeamTotal;
      matchDetails.visitingTeamTotal = match.visitingTeamTotal;
      matchDetails.save(function (err, done) {
        if (!err) {
          res.json({status: 'OK', data: matchDetails});
        } else {
          res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
        }
      });
    } else {
      res.json({exists: false});
    }
  });

};

exports.playerMatches = function (req, res) {
  var player = req.body.playerName;

  Matches.find({$or: [{'visitingTeamBatting.battingScores.player': player}, {'homeTeamBatting.battingScores.player': player}]}, function (err, matches) {
    if (!err) {
      res.json({status: 'OK', data: matches});
    } else {
      res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
    }
  });

};

exports.submitMatch = function (req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;

  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (tournamentDetails) {
      tournamentDetails.matches = tournamentMatches;
      tournamentDetails.save(function (err) {
      });
    } else {
      res.json({exists: false});
    }
  });

  Matches.findOne({'matchNumber': match.matchNumber}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (matchDetails) {
      matchDetails.status = match.status;
      matchDetails.save(function (err, done) {
        if (!err) {
          res.json({status: 'OK', data: matchDetails});
        } else {
          res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
        }
      });
    } else {
      res.json({exists: false});
    }
  });

};
