'use strict';

var mongoose = require('mongoose'),
Team = mongoose.model('Teams'),
TeamList = mongoose.model('TeamsList');



/**
 * Create user profile
 */
 exports.create = function(req, res) {
 	var newTeam = req.body;

 	console.log(newTeam.team[0].players);

 	if (!newTeam) return res.sendStatus(400);
 	else {
    var newTeamList = new Team({
     teamName:newTeam.team[0].teamName,
     owner:newTeam.team[0].owner,
     joiningDate: newTeam.team[0].joiningDate,
     players: newTeam.team[0].players
   });

  }
 	//insert the newly constructed document into the database
 	newTeamList.save(function(err, point){
 		if(err) return console.error(err);
 		else res.json({status: 'OK', data: newTeamList});
 	});

 };



/**
 * Create user profile
 */
 exports.createList = function(req, res) {
 	var reqBody = req.body;

 	if (!reqBody.team) return res.sendStatus(400);
 	else {
 		var newTeam = new TeamList(reqBody)
 		newTeam.save(function(err, point){
 			if(err) return console.error(err);
 			else res.json({status: 'OK', data: newTeam});
 		});
 		
 	}

 };

 exports.show = function(req, res, next) {
  var teamName = req.params.teamName;
  Team.findOne({ teamName : teamName }, function (err, team) {
    if (err) {
      return next(new Error('Failed to load profile ' + username));
    }
    if(team) {
      res.json({exists: true, data: team});
    } else {
      res.json({exists: false});
    }
  });
}

exports.all = function(req, res, next) {
  Team.find(function(err, teams) {
    if (err) {
      return next(new Error('Failed to load teams '));
    }
    if(teams) {
      res.json({exists: true, data: teams});
    } else {
      res.json({exists: false});
    }
  });
}

exports.update = function(req, res, next) {
  var teamName = req.params.teamName;
  Team.findOne({ teamName : teamName }, function (err, team) {
    if (err) {
      return next(new Error('Failed to load profile ' + username));
    }
    if(team) {
      team.players = req.body.team;
      team.save(function (err, done) {
        if (!err) {
         res.json({status: 'OK', data: team});
       } else {
         res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
       }
     }); 
    } else {
      res.json({exists: false});
    }
  });
}