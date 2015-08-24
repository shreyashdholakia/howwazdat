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

/**
 * Define model.s
 */

mongoose.model('Tournament', TournamentSchema);