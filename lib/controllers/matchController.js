'use strict';

var mongoose = require('mongoose'),
  Tournament = mongoose.model('Tournament'),
  Matches = mongoose.model('matches'),
  Team = mongoose.model('Teams'),
  Points = mongoose.model('PointsTable'),
  Statistics = mongoose.model('Statistics');


exports.update = function (req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;
  var battingBowlingTeamDetails = req.body.matches[0].battingBowling; // which team is batting (add details to that team)
  var batterBowler = req.body.matches[0].batterBowler;
  var matchArr = [];

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
    var point, won, lost, tied, homePoint, homeWon, homeLost, visitingPoint, visitingWon, visitingLost, homeTied, visitingTied, home, visiting;

    Points.findOne({'tournament': tournament}, function (err, points) {
      if (points) {
        if (match.result === 'Tie' || match.result === 'Abandoned' || match.result === 'Washed Out') {
          if (match.previousResult === 'Completed') {
            if (match.previousWinningTeam === match.homeTeam) {
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
      matchDetails.toss = match.toss;
      matchDetails.winningTeam = match.winningTeam;
      matchDetails.mom = match.mom;
      matchDetails.updatedBy = match.updatedBy;
      matchDetails.lastUpdated = match.lastUpdated;
      matchDetails.tossDecision = match.tossDecision;
      matchDetails.status = match.status;
      matchDetails.result = match.result;

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

exports.updateMatchScores = function (req, res) {
  var tournament = req.params.tournament;
  var match = req.body.matches[0].single;
  var tournamentMatches = req.body.matches[0].all;
  var battingBowlingTeamDetails = req.body.matches[0].battingBowling; // which team is batting (add details to that team)
  var batterBowler = req.body.matches[0].batterBowler;

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
    var homeTotal = 0, homeOvers = 0, visitingTotal = 0, visitingOvers = 0;
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (matchDetails) {
      if(match.whichTeamTotal === 'home') {
        if (matchDetails.homeTeamTotal && matchDetails.homeTeamTotal.length > 0 && match.homeTeamTotal && match.homeTeamTotal[0].total) {
          if (match.homeTeamTotal[0].total > matchDetails.homeTeamTotal[0].total) {
            homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
          } else if (match.homeTeamTotal[0].total < matchDetails.homeTeamTotal[0].total) {
            homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
          } else {
            homeTotal = match.homeTeamTotal[0].total - matchDetails.homeTeamTotal[0].total;
          }

          if (match.homeTeamTotal[0].overs > matchDetails.homeTeamTotal[0].overs) {
            homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
          } else if (match.homeTeamTotal[0].overs < matchDetails.homeTeamTotal[0].overs) {
            homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
          } else {
            homeOvers = match.homeTeamTotal[0].overs - matchDetails.homeTeamTotal[0].overs;
          }
        } else if (match.homeTeamTotal[0]) {
          homeTotal = match.homeTeamTotal[0].total || 0;
          homeOvers = match.homeTeamTotal[0].overs || 0;
        }

        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
          $inc: {
            'teamStats.$.runs': homeTotal,
            'teamStats.$.overs': homeOvers
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.visitingTeam}]}, {
          $inc: {
            'teamStats.$.runsAgainst' : homeTotal,
            'teamStats.$.oversAgainst': homeOvers
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });

      }

      if(match.whichTeamTotal === 'visiting') {
        if (matchDetails.visitingTeamTotal && matchDetails.visitingTeamTotal.length > 0 && match.visitingTeamTotal && match.visitingTeamTotal[0].total) {

          if (match.visitingTeamTotal[0].total > matchDetails.visitingTeamTotal[0].total) {
            visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
          } else if (match.visitingTeamTotal[0].total < matchDetails.visitingTeamTotal[0].total) {
            visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
          } else {
            visitingTotal = match.visitingTeamTotal[0].total - matchDetails.visitingTeamTotal[0].total;
          }

          if (match.visitingTeamTotal[0].overs > matchDetails.visitingTeamTotal[0].overs) {
            visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
          } else if (match.visitingTeamTotal[0].overs < matchDetails.visitingTeamTotal[0].overs) {
            visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
          } else {
            visitingOvers = match.visitingTeamTotal[0].overs - matchDetails.visitingTeamTotal[0].overs;
          }
        } else if (match.visitingTeamTotal[0]) {
          visitingTotal = match.visitingTeamTotal[0].total || 0;
          visitingOvers = match.visitingTeamTotal[0].overs || 0;
        }

        Points.findOneAndUpdate({$and: [{'tournament': tournament}, {'teamStats.team': match.homeTeam}]}, {
          $inc: {
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
            'teamStats.$.overs': visitingOvers
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return res.send(500, {error: err});
          return res.send("succesfully saved");
        });
      }

      if(battingBowlingTeamDetails == 'home') {
        batterBowler
        matchDetails.homeTeamBatting.push(batterBowler[0]);
        updatePlayerScores(tournament, match.homeTeam, batterBowler);
      } else if(battingBowlingTeamDetails == 'visiting') {
        matchDetails.visitingTeamBatting.push(batterBowler[0]);
        updatePlayerScores(tournament, match.visitingTeam, batterBowler);
      }
      if(battingBowlingTeamDetails == 'homeBowling') {
        matchDetails.homeTeamBowling.push(batterBowler[0]);
        updatePlayerBowlingScores(tournament, match.homeTeam, batterBowler);
      } else if(battingBowlingTeamDetails == 'visitingBowling') {
        matchDetails.visitingTeamBowling.push(batterBowler[0]);
        updatePlayerBowlingScores(tournament, match.homeTeam, batterBowler);
      }

      matchDetails.updatedBy = match.updatedBy;
      matchDetails.lastUpdated = match.lastUpdated;
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
}

exports.playerMatches = function (req, res) {
  var player = req.body.playerName;

  Matches.find({$or: [{'visitingTeamBatting.player': player}, {'homeTeamBatting.player': player}]}, function (err, matches) {
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

exports.updateBattingScore = function (req, res) {
  var team = req.params.team;
  var scores = req.body.scores[0];
  var tournament = req.body.scores[0].tournament;
  var match = req.body.scores[0].matchNumber;
  var battingTeam = req.body.scores[0].battingTeam;
  var runs = 0;
  var balls = 0;

  Matches.findOne({'matchNumber': match}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if(matchDetails) {
      matchDetails.homeTeamBatting.forEach(function (batter) {
        if(batter.email === scores.new.email) {
          runs = scores.new.runs - batter.runs;
          balls = scores.new.balls - batter.balls;
        }
      });

      Statistics.findOneAndUpdate({$and: [{'tournament': tournament}, {'teams.email': scores.new.email}]}, {
        $inc: {
          'teams.$.runs': runs,
          'teams.$.ballFaced' : balls
        }
      }, {upsert: true}, function (err, stats) {
        if (err) return console.log(err);
        else res.json({status: 'OK', data: stats});
      });

      Team.findOneAndUpdate({$and: [{'teamName': team}, {'players.email': scores.new.email}]}, {
        $inc: {
          'players.$.runs': runs,
          'players.$.ballFaced': balls
        }
      }, {upsert: true}, function (err, teamInfo) {
        if (err) return console.log(err);
        else res.json({status: 'OK', data: teamInfo});
      });

      if(battingTeam === 'home') {
         Matches.findOneAndUpdate({$and: [{'matchNumber': match}, {'homeTeamBatting.email': scores.new.email}]}, {
            $set: {
              'homeTeamBatting.$.runs': scores.new.runs,
              'homeTeamBatting.$.ballFaced' : scores.new.balls,
              'homeTeamBatting.$.outNotOut' : scores.new.outNotOut,
              'homeTeamBatting.$.fielder' : scores.new.fielder,
              'homeTeamBatting.$.bowler': scores.new.bowler,
              'homeTeamBatting.$.fours' : scores.new.fours,
              'homeTeamBatting.$.sixes' : scores.new.sixes,
              'homeTeamBatting.$.howOut' : scores.new.howOut,
              'homeTeamBatting.$.strikeRate' : scores.new.strikeRate
            }
          }, {upsert: true}, function (err, matchInfo) {
            if (err) return console.log(err);
            else res.json({status: 'OK', data: matchInfo});
          });
        } else {
         Matches.findOneAndUpdate({$and: [{'matchNumber': match}, {'visitingTeamBatting.email': scores.new.email}]}, {
            $set: {
              'visitingTeamBatting.$.runs': scores.new.runs,
              'visitingTeamBatting.$.ballFaced' : scores.new.balls,
              'visitingTeamBatting.$.outNotOut' : scores.new.outNotOut,
              'visitingTeamBatting.$.fielder' : scores.new.fielder,
              'visitingTeamBatting.$.bowler': scores.new.bowler,
              'visitingTeamBatting.$.fours' : scores.new.fours,
              'visitingTeamBatting.$.sixes' : scores.new.sixes,
              'visitingTeamBatting.$.howOut' : scores.new.howOut,
              'visitingTeamBatting.$.strikeRate' : scores.new.strikeRate
            }
         }, {upsert: true}, function (err, matchInfo) {
            if (err) return console.log(err);
            else res.json({status: 'OK', data: matchInfo});
         });
        }
      return res.json({status: 'OK'});
    }
  });
};

function updatePlayerScores(tournament, team, battingDetails) {
  var details = battingDetails[0];
  if(battingDetails && battingDetails.length > 0) {
      var fifties = (details.runs >= 50 && details.runs < 100)? 1: 0;
      var hundreds = (details.runs >= 100)? 1: 0;
      Statistics.findOneAndUpdate({$and: [{'tournament': tournament}, {'teams.player': details.player}]}, {
          $inc: {
            'teams.$.matches': 1,
            'teams.$.runs': details.runs,
            'teams.$.fifties': fifties,
            'teams.$.hundreds': hundreds,
            'teams.$.innings': 1,
            'teams.$.ballFaced' : details.balls
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return console.log(err);
      });

      Team.findOneAndUpdate({$and: [{'teamName': team}, {'players.email': details.email}]}, {
          $inc: {
              'players.$.matches': 1,
              'players.$.runs': details.runs,
              'players.$.fifties': fifties,
              'players.$.hundreds': hundreds,
              'players.$.innings': 1,
              'players.$.ballFaced': details.balls
            }
          }, {upsert: true}, function (err, doc) {
            if (err) return console.log(err);
      });
  }
}

function updatePlayerBowlingScores(tournament, team, battingDetails) {
  var details = battingDetails[0];
  if(battingDetails && battingDetails.length > 0) {
    Statistics.findOneAndUpdate({$and: [{'tournament': tournament}, {'teams.player': details.player}]}, {
      $inc: {
        'teams.$.runsGiven': details.runs,
        'teams.$.overs': details.overs,
        'teams.$.wickets': details.wickets
      }
    }, {upsert: true}, function (err, doc) {
      if (err) return console.log(err);
    });

    Team.findOneAndUpdate({$and: [{'teamName': team}, {'players.email': details.email}]}, {
          $inc: {
            'players.$.runsGiven': details.runs,
            'players.$.ballBowled': (details.overs * 6),
            'players.$.wickets': details.wickets
          }
        }, {upsert: true}, function (err, doc) {
          if (err) return console.log(err);
        });
  }
}
