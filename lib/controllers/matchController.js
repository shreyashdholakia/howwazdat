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
    var point, won, lost, tied, homePoint, homeWon, homeLost, visitingPoint, visitingWon, visitingLost, homeTied, visitingTied, home, visiting;

    Points.findOne({'tournament': tournament}, function (err, points) {
      if (points) {
        if (match.result === 'Tie' || match.result === 'Abandoned' || match.result === 'Washed Out') {
          if (previousMatchResult.result === 'Completed') {
            if (previousMatchResult.winningTeam === match.homeTeam) {
              visiting = match.visitingTeam;
              home = match.homeTeam;
            } else {
              home = match.visitingTeam;
              visiting = match.homeTeam;
            }
          }
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': home}]}, {
            $inc: {
              'teamStats.$.points': -1,
              'teamStats.$.won': -1,
              'teamStats.$.lost': 0,
              'teamStats.$.tied': 1
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': visiting}]}, {
            $inc: {
              'teamStats.$.points': 1,
              'teamStats.$.won': 0,
              'teamStats.$.lost': -1,
              'teamStats.$.tied': 1
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });
        } else {
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
            $inc: {
              'teamStats.$.points': 1,
              'teamStats.$.won': 1,
              'teamStats.$.lost': 0,
              'teamStats.$.tied': -1
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return res.send(500, {error: err});
            return res.send("succesfully saved");
          });

          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.losingTeam}]}, {
            $inc: {
              'teamStats.$.points': -1,
              'teamStats.$.won': 0,
              'teamStats.$.lost': 1,
              'teamStats.$.tied': -1
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
        if (match.result === 'Tie' || match.result === 'Abandoned' || match.result === 'Washed Out') {
          point = 1;
          won = 0;
          lost = 0;
          tied = 1;
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
            $inc: {
              'teamStats.$.points': point,
              'teamStats.$.won': won,
              'teamStats.$.lost': lost,
              'teamStats.$.games': 1,
              'teamStats.$.tied': tied
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
              'teamStats.$.games': 1,
              'teamStats.$.tied': tied
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
          Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.winningTeam}]}, {
            $inc: {
              'teamStats.$.points': 2,
              'teamStats.$.won': 1,
              'teamStats.$.lost': 0,
              'teamStats.$.games': 1,
              'teamStats.$.tied': 0
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
              'teamStats.$.games': 1,
              'teamStats.$.tied': 0
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
    var homeTotal = 0, homeOvers = 0, visitingTotal = 0, visitingOvers = 0;
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (matchDetails) {
      if(matchDetails.homeTeamTotal && matchDetails.homeTeamTotal.length > 0) {
        if(match.homeTeamTotal[0].total > matchDetails.homeTeamTotal[0].total) {
          homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
        } else if (match.homeTeamTotal[0].total < matchDetails.homeTeamTotal[0].total) {
          homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
        } else {
          homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
        }

        if(match.homeTeamTotal[0].overs > matchDetails.homeTeamTotal[0].overs) {
          homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
        } else if (match.homeTeamTotal[0].overs < matchDetails.homeTeamTotal[0].overs) {
          homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
        } else {
          homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
        }
      } else if(match.homeTeamTotal[0]) {
        homeTotal = match.homeTeamTotal[0].total || 0;
        homeOvers = match.homeTeamTotal[0].overs || 0;
      }
      if(matchDetails.visitingTeamTotal && matchDetails.visitingTeamTotal.length > 0) {

        if(match.visitingTeamTotal[0].total > matchDetails.visitingTeamTotal[0].total) {
          visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
        } else if (match.visitingTeamTotal[0].total < matchDetails.visitingTeamTotal[0].total) {
          visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
        } else {
          visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
        }

        if(match.visitingTeamTotal[0].overs > matchDetails.visitingTeamTotal[0].overs) {
          visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
        } else if (match.visitingTeamTotal[0].overs < matchDetails.visitingTeamTotal[0].overs) {
          visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
        } else {
          visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
        }
      } else if(match.visitingTeamTotal[0]) {
        visitingTotal = match.visitingTeamTotal[0].total || 0;
        visitingOvers = match.visitingTeamTotal[0].overs || 0;
      }

      Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
        $inc: {
          'teamStats.$.runs': homeTotal,
          'teamStats.$.overs': homeOvers,
          'teamStats.$.runsAgainst' : visitingTotal,
          'teamStats.$.oversAgainst': visitingOvers
        }
      }, {upsert: true}, function (err, doc) {
        if (err) return res.send(500, {error: err});
        return res.send("succesfully saved");
      });

      Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.visitingTeam}]}, {
        $inc: {
          'teamStats.$.runs': visitingTotal,
          'teamStats.$.overs': visitingOvers,
          'teamStats.$.runsAgainst' : homeTotal,
          'teamStats.$.oversAgainst': homeOvers
        }
      }, {upsert: true}, function (err, doc) {
        if (err) return res.send(500, {error: err});
        return res.send("succesfully saved");
      });

      matchDetails.toss = match.toss;
      matchDetails.winningTeam = match.winningTeam;
      matchDetails.mom = match.mom;
      matchDetails.tossDecision = match.tossDecision;
      matchDetails.status = match.status;
      matchDetails.result = match.result;
      matchDetails.homeTeamBatting = match.homeTeamBatting;
      matchDetails.homeTeamTotal = match.homeTeamTotal;
      matchDetails.visitingTeamBowling = match.visitingTeamBowling;
      matchDetails.visitingTeamTotal = match.visitingTeamTotal;
      matchDetails.visitingTeamBatting = match.visitingTeamBatting;
      matchDetails.homeTeamBowling = match.homeTeamBowling;
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
