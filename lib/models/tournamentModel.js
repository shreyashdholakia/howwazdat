'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TournamentSchema = new Schema({
  tournamentName: {
    type: String,
    unique: true,
    required: true
  },
  updatedBy: String,
  lastUpdated: Date,
  address: String,
  addressLatitude: String,
  addressLongitude: String,
  owner: String,
  organizer: String,
  createdDate: Date,
  matchNumber: String,
  teams: {},
  matches: {},
  tournamentPicture: { data: Buffer, contentType: String },
  tournamentNumber: { type: Number, default: 0 }
});

var MatchSchema = new Schema ({
  tournament: String,
  updatedBy: String,
  lastUpdated: Date,
  homeTeam: String,
  visitingTeam: String,
  matchDate: Date,
  winningTeam: String,
  matchNumber: String,
  toss:String,
  tossDecision: String,
  mom: String,
  status: String,
  homeTeamTotal: {},
  visitingTeamTotal:{},
  homeTeamBatting: [],
  visitingTeamBowling: [],
  visitingTeamBatting: [],
  homeTeamBowling: [],
  admin: [],
  result: String,
  roundType: String
});

/**
 * Define model.s
 */

mongoose.model('Tournament', TournamentSchema);
mongoose.model('matches', MatchSchema);
