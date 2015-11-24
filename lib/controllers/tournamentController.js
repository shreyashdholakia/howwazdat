'use strict';

var mongoose = require('mongoose'),
  nodemailer = require('nodemailer'),
  Tournament = mongoose.model('Tournament'),
  Matches = mongoose.model('matches'),
  Team = mongoose.model('Teams'),
  Points = mongoose.model('PointsTable'),
  Statistics = mongoose.model('Statistics'),
  fs = require('fs');

var transporter = nodemailer.createTransport();

/**
 * Create user profile
 */
exports.create = function (req, res) {
  var tournament = req.body.tournament;


  if (!tournament) return res.sendStatus(400);
  else {
    Tournament.findOne()
      .sort('-tournamentNumber')  // give me the max
      .exec(function (err, tourni) {
        var newTournament = new Tournament({
          tournamentName: tournament[0].tournamentName,
          organizer: tournament[0].organizer,
          owner: tournament[0].owner,
          updatedBy: tournament[0].updatedBy,
          lastUpdated: tournament[0].lastUpdated,
          createdDate: tournament[0].createdDate,
          address: tournament[0].address,
          addressLatitude: tournament[0].addressLatitude,
          addressLongitude: tournament[0].addressLongitude,
          tournamentNumber: tourni.tournamentNumber + 1
        });


        //insert the newly constructed document into the database
        newTournament.save(function (err, point) {
          if (err) return console.error(err);
          else res.json({status: 'OK', data: newTournament});
        });
      });
  }

  var mailOptions = {
    from: 'How Was That<info@howwazthat.com>', // sender address
    to: 'shreyashdholakia@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ✔', // plaintext body
    html: '<b>Hello world ✔</b>' // html body
  };

// send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);

  });

  var statistics = new Statistics({
    tournament: tournament[0].tournamentName
  });

  statistics.save(function (err, point) {
    if (err) return console.error(err);
  });

  var pointsTournament = new Points({
    tournament: tournament[0].tournamentName
  });

  pointsTournament.save(function (err, point) {
    if (err) return console.error(err);
  });

};

exports.show = function (req, res, next) {
  var tournament = req.params.tournamentName;
  Tournament.findOne({tournamentNumber: tournament}, function (err, tournament) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (tournament) {
      if(tournament.tournamentPicture.data) {
        var base64 = (tournament.tournamentPicture.data.toString('base64'));
        res.json({exists: true, data: tournament});
      } else {
        res.json({exists: true, data: tournament});
      }
    } else {
      res.json({exists: false});
    }
  });
};

//exports.getTournamentPicture = function (req, res, next) {
//  var tournament = req.params.tournamentName;
//  Tournament.findOne({tournamentName: tournament}, function (err, tournament) {
//    if (err) {
//      return next(new Error('Failed to load tournament ' + tournament));
//    }
//    if (tournament) {
//      if(tournament.tournamentPicture.data) {
//        var base64 = (tournament.tournamentPicture.data.toString('base64'));
//        res.json({exists: true, image: base64});
//      } else {
//        res.json({exists: true, data: tournament});
//      }
//      res.json({exists: true, data: tournament});
//    } else {
//      res.json({exists: false});
//    }
//  });
//};

exports.addTeams = function (req, res) {
  var tournament = req.params.tournamentName;
  var teams = req.body.teams;
  var team, playerInfo, players;
  var stats = [];
  var playerStats = [];

  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }

    if (tournamentDetails) {
      tournamentDetails.teams = req.body.teams;
      tournamentDetails.save(function (err, done) {
        if (!err) {
          res.json({status: 'OK', data: tournamentDetails});
        } else {
          res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
        }
      });
    } else {
      res.json({exists: false});
    }
  });

  for (team in teams) {
    Team.findOne({'teamName': teams[team].teamName}, function (err, teamDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + team));
      }
      if (teamDetails) {
        var index = teamDetails.tournaments.indexOf(tournament) > -1;
        if (!index) {
          teamDetails.tournaments.push(tournament);
          teamDetails.save(function (err) {
          });
        }

        }
      });
    Statistics.find({$and: [{'tournament': tournament}, {'teams.team': teams[team].teamName}]}, function (err, tournamentStats) {
      if (err) {
        return next(new Error('Failed to load statistics ' + tournamentStats));
      }
      if (tournamentStats.length == 0) {
        Statistics.findOne({tournament: tournament}, function (err, tournamentStats) {
          if (err) {
            return next(new Error('Failed to load statistics ' + tournamentStats));
          }
          if (tournamentStats) {
            var infoPlayers;
            getPlayers(teams[team].teamName, function(err, players) {
              if (err) {
                console.log(err);
              }
              infoPlayers = players;
              infoPlayers.forEach(function (player)
              {
                 var fullName = player.firstName + ' ' + player.lastName;
                 tournamentStats.teams.push({
                     team: teams[team].teamName,
                     player: fullName,
                     email: player.email,
                     matches: Number(0),
                     runs: Number(0),
                     ballFaced: Number(0),
                     fifties: Number(0),
                     hundreds: Number(0),
                     innings: Number(0),
                     highestScore: Number(0),
                     wickets: Number(0),
                     overs: Number(0),
                     fiveFors: Number(0),
                     runsGiven: Number(0)
                 });
              });
              tournamentStats.save(function (err) {});
            });
          }
        });
      }
    });

    Points.findOne({'tournament': tournament}, function (err, tournamentDetails) {
      if (err) {
        return next(new Error('Failed to load tournament ' + team));
      }
      if (tournamentDetails) {
        if (tournamentDetails.teamStats) {
          var index = tournamentDetails.teamStats.indexOf(teams[team].teamName) > -1;
          if (!index) {
            stats = tournamentDetails.teamStats;
            stats.push({
              team: teams[team].teamName,
              games: Number(0),
              lost: Number(0),
              points: Number(0),
              won: Number(0),
              tied: Number(0),
              runs: Number(0),
              overs: Number(0),
              runsAgainst: Number(0),
              oversAgainst: Number(0)
            });
            tournamentDetails.teamStats = stats;
          }
        } else {
          stats.push({
            team: teams[team].teamName,
            games: Number(0),
            lost: Number(0),
            points: Number(0),
            won: Number(0),
            tied: Number(0),
            runs: Number(0),
            overs: Number(0),
            runsAgainst: Number(0),
            oversAgainst: Number(0)
          });
          tournamentDetails.teamStats = stats;
        }
        tournamentDetails.save(function (err) {
        });
      }
    });
  }
};

exports.addMatches = function (req, res) {
  var tournament = req.params.tournamentName;

  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (tournamentDetails) {
      tournamentDetails.matches = req.body.matches[0].all;
      tournamentDetails.save(function (err, done) {
        if (!err) {
          res.json({status: 'OK', data: tournamentDetails});
        } else {
          res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
        }
      });
    } else {
      res.json({exists: false});
    }
  });
  var newMatch = new Matches(req.body.matches[0].single[0]);
    newMatch.save(function (err) {
  });

  Team.findOne({'teamName': req.body.matches[0].single[0].homeTeam}, function (err, teamDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (teamDetails) {
      teamDetails.matches = teamDetails.matches + 1;
      teamDetails.save(function (err) {
      });
    }
  });

  Team.findOne({'teamName': req.body.matches[0].single[0].visitingTeam}, function (err, teamDetails) {
    if (err) {
      return next(new Error('Failed to load tournament ' + tournament));
    }
    if (teamDetails) {
      teamDetails.matches = teamDetails.matches + 1;
      teamDetails.save(function (err) {
      });
    }
  });

}


exports.match = function (req, res) {
  var tournament = req.params.tournament;
  var match = req.params.matchNumber;

  Matches.findOne({'matchNumber': match}, function (err, matchDetails) {
    if (err) {
      return next(new Error('Failed to load match details ' + tournament + ' - ' + match));
    }
    if (matchDetails) {
      res.json({status: 'OK', data: matchDetails});
    } else {
      res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
    }
  });
};

exports.all = function (req, res) {
  Tournament.find(function (err, tournaments) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if (tournaments) {
      res.json({exists: true, data: tournaments});
    } else {
      res.json({exists: false});
    }
  });
};

exports.tournamentPicture = function (req, res, next) {
  var tournament = req.params.tournamentName;
  Tournament.findOne({'tournamentName': tournament}, function (err, tournamentDetails) {
    if (req.files.file) {   // If the Image exists
      var fileName = req.files.file.originalFilename;
      var extension = fileName.substring(
        fileName.lastIndexOf('.') + 1).toLowerCase();
      if (extension == "png" || extension == "bmp"
        || extension == "jpeg" || extension == "jpg") {
          fs.readFile(req.files.file.path, function (dataErr, data) {
            if (data) {
              tournamentDetails.tournamentPicture.data = new Buffer(data, "base64");
              tournamentDetails.tournamentPicture.contentType = req.files.file.type;
              tournamentDetails.save(function (err, pic) {
                if (err) {
                  return next(new Error('Failed to load profile ' + email));
                } else {
                  var base64 = (pic.tournamentPicture.data.toString('base64'));
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

function getPlayers(team, callback) {
  Team.findOne({'teamName': team}, function (err, teamDetails) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, teamDetails.players);
    }

  });
}
