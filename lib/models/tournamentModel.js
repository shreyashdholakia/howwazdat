'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TournamentSchema = new Schema({
  tournamentName: {
    type: String,
    unique: true,
    required: true
  },
  address: String,
  addressLatitude: String,
  addressLongitude: String,
  owner: String,
  organizer: String,
  createdDate: Date,
  matchNumber: String,
  teams: {},
  matches: {}

});

var MatchSchema = new Schema ({
  tournamentName: String,
  homeTeam: String,
  visitingTeam: String,
  matchDate: Date,
  winningTeam: String,
  matchNumber: String,
  toss:String,
  tossDecision: String,
  mom: String
});

/**
 * Define model.s
 */

mongoose.model('Tournament', TournamentSchema);
mongoose.model('matches', MatchSchema);
