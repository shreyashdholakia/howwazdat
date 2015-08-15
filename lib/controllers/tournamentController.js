'use strict';

var mongoose = require('mongoose'),
Tournament = mongoose.model('Tournament');



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
 			city: tournament[0].city,
 			address: tournament[0].address
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