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
  var previousMatchResult;

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

  Matches.findOne({'matchNumber': match.matchNumber}, function (err, matchDetails) {
    previousMatchResult = matchDetails;
  });

  if (match.scoreCard == 'changed') {
    var point, won, lost, tied, homePoint, homeWon, homeLost, visitingPoint, visitingWon, visitingLost, homeTied, visitingTied;

    Points.findOne({'tournament': tournament}, function (err, points) {
      if (points) {
        console.log(match.previousResult);
        console.log(previousMatchResult);
        if(match.result === 'Tie' || match.result === 'Abandoned' || match.result === 'Washed Out') {
          console.log("changed tied");
          if(previousMatchResult.result === 'Completed') {
            if(previousMatchResult.winningTeam === match.homeTeam) {
            console.log("winningteam same");
              homePoint = -1;
              homeWon = -1;
              homeLost = -1;
              homeTied = 1;
            } else {
            console.log("winning team not same");
              homePoint = 1;
              homeWon = 0;
              homeLost = 1;
              homeTied = 1
            }

            if (previousMatchResult.winningTeam === match.visitingTeam){
              console.log("losing team same");
              visitingPoint = -1;
              visitingWon = -1;
              visitingLost = -1;
              visitingTied = 1;
            } else {
              console.log("losing team not same");
              visitingPoint = 1;
              visitingWon = 0;
              visitingLost = 1;
              visitingTied = 1;
            }
          }

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
            $inc: {
              'teamStats.$.points': homePoint,
              'teamStats.$.won': homeWon,
              'teamStats.$.lost': homeLost,
              'teamStats.$.tied' : homeTied
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.visitingTeam}]}, {
            $inc: {
              'teamStats.$.points': visitingPoint,
              'teamStats.$.won': visitingWon,
              'teamStats.$.lost': visitingLost,
              'teamStats.$.tied' : visitingTied
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });
        } else {
          console.log("changed not tied");
          point = 2;
          won = 1;
          lost = 1;
          tied = 0;
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
            $inc: {
              'teamStats.$.points': 1,
              'teamStats.$.won': 1,
              'teamStats.$.lost': 0,
              'teamStats.$.tied' : -1
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.losingTeam}]}, {
            $inc: {
              'teamStats.$.points': -1 ,
              'teamStats.$.won': 0,
              'teamStats.$.lost': 1,
              'teamStats.$.tied' : -1
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });
        }
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
        if(match.result === 'Tie' || match.result === 'Abandoned' || match.result === 'Washed Out') {
          point = 1;
          won = 0;
          lost = 0;
          tied = 1;
          console.log("new tied");
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
            $inc: {
              'teamStats.$.points': point,
              'teamStats.$.won': won,
              'teamStats.$.lost': lost,
              'teamStats.$.games' : 1,
              'teamStats.$.tied' : tied
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.visitingTeam}]}, {
            $inc: {
              'teamStats.$.points': point,
              'teamStats.$.won': won,
              'teamStats.$.lost': lost,
              'teamStats.$.games' : 1,
              'teamStats.$.tied' : tied
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });
          Team.findOne({'teamName': match.winningTeam}, function (err, teamDetails) {
            if (err) {
              return next(new Error('Failed to load tournament ' + match.winningTeam));
            }
            if (teamDetails) {
              teamDetails.tie.push({
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
              teamDetails.tie.push({
                tournament: tournament,
                matchNumber: match.matchNumber
              });
              teamDetails.save(function (err) {
              });
            }
          });
        } else {
          console.log("new not tied");
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
            $inc: {
              'teamStats.$.points': 2,
              'teamStats.$.won': 1,
              'teamStats.$.lost': 0,
              'teamStats.$.games' : 1,
              'teamStats.$.tied' : 0
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.losingTeam}]}, {
            $inc: {
              'teamStats.$.points': 0 ,
              'teamStats.$.won': 0,
              'teamStats.$.lost': 1,
              'teamStats.$.games' : 1,
              'teamStats.$.tied' : 0
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
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
      matchDetails.result = match.result;
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
