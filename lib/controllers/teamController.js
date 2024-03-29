'use strict';

var mongoose = require('mongoose'),
  Team = mongoose.model('Teams'),
  TeamList = mongoose.model('TeamsList'),
  Profile = mongoose.model('UserProfile'),
  Matches = mongoose.model('matches');


/**
 * Create user profile
 */
exports.create = function (req, res) {
  var newTeam = req.body;
  var teamNumber = 0;
  if (!newTeam) return res.sendStatus(400);
  else {
    Team.findOne()
      .sort('-teamNumber')  // give me the max
      .exec(function (err, team) {
        if(team) {
          teamNumber = team.teamNumber + 1;
        } else {
          teamNumber = 0;
        }
        var newTeamList = new Team({
          teamName: newTeam.team[0].teamName,
          owner: newTeam.team[0].owner,
          joiningDate: newTeam.team[0].joiningDate,
          players: newTeam.team[0].players,
          teamNumber: teamNumber
        });

        //insert the newly constructed document into the database
        newTeamList.save(function (err, point) {
          if (err) return console.error(err);
          else res.json({status: 'OK', data: newTeamList});
        });
    });
  }
};

/**
 * Create user profile
 */
exports.createList = function (req, res) {
  var reqBody = req.body;

  if (!reqBody.team) return res.sendStatus(400);
  else {
    var newTeam = new TeamList(reqBody);
    newTeam.save(function (err, point) {
      if (err) return console.error(err);
      else res.json({status: 'OK', data: newTeam});
    });
  }
};

exports.show = function (req, res, next) {
  var teamName = req.params.teamName;
  Team.findOne({teamName: teamName}, function (err, team) {
    if (err) {
      return next(new Error('Failed to load profile ' + username));
    }
    if (team) {
      res.json({exists: true, data: team});
    } else {
      res.json({exists: false});
    }
  });
};

exports.all = function (req, res, next) {
  Team.find(function (err, teams) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if (teams) {
      res.json({exists: true, data: teams});
    } else {
      res.json({exists: false});
    }
  });
}

exports.update = function (req, res, next) {
  var teamName = req.params.teamName;

  Profile.findOne()
        .sort('-userNumber')  // give me the max
        .exec(function (err, member) {
            Team.findOne({teamName: teamName}, function (err, team) {
              if (err) {
                return next(new Error('Failed to load profile ' + username));
              }
              if (team) {
                req.body.team[0].userNumber = member.userNumber + 1;
                team.players.push(req.body.team[0]);
                team.save(function (err, done) {
                  if (!err) {
                    res.json({status: 'OK', data: team});
                  } else {
                    res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
                  }
                });
              } else {
                res.json({exists: false});
              }
            });

            var newUser = req.body.team[0].newUser;
            if(newUser) {
                  var profile = new Profile({
                    firstname: req.body.team[0].firstName,
                    lastname: req.body.team[0].lastName,
                    email: req.body.team[0].email,
                    joiningDate: new Date(),
                    userNumber: member.userNumber + 1
                  });

                  profile.save(function (err, done) {
                    if (err) {
                      res.json(500, err);
                    }
                  });
              }
  });
};

exports.deletePlayer = function (req, res, next) {
  var team = req.params.teamName;
  var player = req.body.player;
  Team.update(
    {teamName: team },
    { $pull: { players: { firstName: player.firstName, lastName: player.lastName}}},
    { multi: true }, function(err, team){
      res.json({status: 'OK', data: team});
    });

};

exports.clonePlayer = function (req, res, next) {
  var teamName = req.params.teamName;
  var player = req.body.player;

  Team.findOne({$and: [{teamName: teamName}, {'players.email': player.email}]}, function (err, info) {
    if (err) {
      return next(new Error('Failed to load team ' + teamName));
    }
    if (!info) {
      Team.findOne({teamName: teamName}, function (err, team) {
        team.players.push(player);
        team.save(function (err, done) {
          if (!err) {
            res.json({status: 'Add', data: team});
          } else {
            res.send({'Status code': 500, 'statusText': 'Internal Server Error'});
          }
        });
      });
    } else {
      res.json({exists: false, status: 'Not Found', 'statusText': 'Player already part of the team'});
    }
  });
};

exports.userTeams = function(req, res, next) {
  var userEmail = req.body.user;
  Team.find({'players.email': userEmail}, function (err, userTeams) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if (userTeams) {
      res.json({exists: true, data: userTeams});
    } else {
      res.json({exists: false});
    }
  });
};

exports.teamMatches = function (req, res, next) {
  var teamName = req.params.teamName;

  Matches.find({$or: [{homeTeam: teamName}, {visitingTeam: teamName}]}, function (err, info) {
    if(err) {
      res.send({'Status code': 500, 'statusText': 'Failed to load team matches'});
    }
    if(info) {
      res.json({status: 'Ok', data: info});
    }
  });
};
