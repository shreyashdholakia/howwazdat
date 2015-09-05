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
  teams: {},
  matches: {}

});

var MatchSchema = new Schema ({
  tournamentName: String,
  homeTeam: String,
  visitingTeam: String,
  matchDate: Date,
  winner: String
});

/**
 * Define model.s
 */

mongoose.model('Tournament', TournamentSchema);
mongoose.model('matches', MatchSchema);