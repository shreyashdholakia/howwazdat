'use strict';

var mongoose = require('mongoose'),
  Tournament = mongoose.model('Tournament'),
  Matches = mongoose.model('matches'),
  Team = mongoose.model('Teams'),
  Points = mongoose.model('PointsTable');


exports.update = function(req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;
  var matchArr = [];

  matchArr.push({
    tournament: tournament,
    matchNumber: match.matchNumber
  });

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

  if(match.scoreCard == 'changed') {
    var i, lostWinning, wonWinning, pointWinning, lostLosing, wonLosing, pointLosing;

    Points.findOne({'teamStats.team': match.winningTeam}, function (err, points) {

      points.teamStats.forEach(function (teams) {
        if (teams.team === match.winningTeam) {
            lostWinning = (Number(points.teamStats.lost) - 1);
            wonWinning = (Number(points.teamStats.won) + 1);
            pointWinning = (Number(points.teamStats.points) + 2);
        } else if (teams.team === match.losingTeam) {
            lostLosing = (Number(points.teamStats.lost) + 1);
            wonWinning = (Number(points.teamStats.won) - 1);
            pointLosing = (Number(points.teamStats.points) - 2);
        }
      });

      Points.findOneAndUpdate({'teamStats.team': match.winningTeam}, {$set:  {'teamStats.$.points': pointWinning, 'teamStats.$.lost': lostWinning, 'teamStats.$.won': wonWinning}}, {upsert:true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        return res.send("succesfully saved");
      });

      Points.findOneAndUpdate({'teamStats.team': match.losingTeam}, {$set:  {'teamStats.$.points': pointLosing, 'teamStats.$.lost': lostLosing, 'teamStats.$.won': wonLosing}}, {upsert:true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        return res.send("succesfully saved");
      });

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
  } else if(match.scoreCard == 'new') {

    stats.push({
            team: match.winningTeam,
            games: 1,
            won : 1,
            points: 2
    });

    stats.push({
              team: match.losingTeam,
              games: 1,
              lost : 1,
              points: 0
    });

    var pointsTable = new Points({
               tournament: tournament,
               teamStats : stats
           });

    pointsTable.save(function(err, points){
      if(err) return console.error(err);
      else res.json({status: 'OK'});
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
      matchDetails.homeTeamTotal = match.homeTeamTotal;
      matchDetails.visitingTeamTotal = match.visitingTeamTotal;
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

};

exports.playerMatches = function (req, res) {
  var player = req.body.playerName;

  Matches.find( { $or:[ {'visitingTeamBatting.battingScores.player': player}, {'homeTeamBatting.battingScores.player': player} ]}, function(err,matches) {
            if(!err) {
              res.json({status: 'OK', data: matches});
            } else {
              res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
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
    if(tournamentDetails) {
      tournamentDetails.matches = tournamentMatches;
      tournamentDetails.save(function (err) {});
    } else {
      res.json({exists: false});
    }
  });

  Matches.findOne({'matchNumber': match.matchNumber}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if(matchDetails) {
      matchDetails.status = match.status;
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

};
