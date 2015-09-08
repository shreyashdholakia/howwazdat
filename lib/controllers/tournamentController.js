'use strict';

var mongoose = require('mongoose'),
Tournament = mongoose.model('Tournament'),
Matches = mongoose.model('matches');



/**
 * Create user profile
 */
 exports.create = function(req, res) {
 	var tournament = req.body.tournament;


 	if (!tournament) return res.sendStatus(400);
 	else {
 		var newTournament = new Tournament({
 			tournamentName: tournament[0].tournamentName,
 			organizer: tournament[0].organizer,
 			owner: tournament[0].owner,
 			createdDate: tournament[0].createdDate,
 			address: tournament[0].address,
 			addressLatitude: tournament[0].addressLatitude,
 			addressLongitude: tournament[0].addressLongitude
 		});

 	}
 	//insert the newly constructed document into the database
 	newTournament.save(function(err, point){
 		if(err) return console.error(err);
 		else res.json({status: 'OK', data: newTournament});
 	});

 };

 exports.show = function(req, res, next) {
 	var tournament = req.params.tournamentName;
 	Tournament.findOne({ tournamentName : tournament }, function (err, tournament) {
 		if (err) {
 			return next(new Error('Failed to load tournament ' + tournament));
 		}
 		if(tournament) {
 			res.json({exists: true, data: tournament});
 		} else {
 			res.json({exists: false});
 		}
 	});
 };

 exports.addTeams = function(req, res) {
 	var tournament = req.params.tournamentName;

 	Tournament.findOne({ 'tournamentName': tournament }, function (err, tournamentDetails) {
 		if (err) {
 			return next(new Error('Failed to load tournament ' + tournament));
 		}
 		if(tournamentDetails) {
 			console.log(req.body.teams);
 			tournamentDetails.teams = req.body.teams;
 			tournamentDetails.save(function (err, done) {
 				if (!err) {
 					res.json({status: 'OK', data: tournamentDetails});
 				} else {
 					res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
 				}
 			});
 		} else {
 			res.json({exists: false});
 		}
 	});
 }

 exports.addMatches = function(req, res) {
 	var tournament = req.params.tournamentName;

 	Tournament.findOne({ 'tournamentName': tournament }, function (err, tournamentDetails) {
 		if (err) {
 			return next(new Error('Failed to load tournament ' + tournament));
 		}
 		if(tournamentDetails) {
 			tournamentDetails.matches = req.body.matches[0].all;
 			tournamentDetails.save(function (err, done) {
 				if (!err) {
 					res.json({status: 'OK', data: tournamentDetails});
 				} else {
 					res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
 				}
 			});
 		} else {
 			res.json({exists: false});
 		}
 	});
	 	var newMatch = new Matches (req.body.matches[0].single[0]);
	 	newMatch.save(function (err) {});

 }


 exports.match = function(req, res) {
  	var tournament = req.params.tournament;
  	var match = req.params.matchNumber;

  	Matches.findOne({'matchNumber': match}, function (err, matchDetails) {
      if (err) {
         return next(new Error('Failed to load match details ' + tournament + ' - ' + match));
      }
      if(matchDetails) {
         res.json({status: 'OK', data: matchDetails});
      } else {
         res.send({ 'Status code': 500, 'statusText': 'Internal Server Error' });
      }
   });
 }
