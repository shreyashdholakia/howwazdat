'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TournamentSchema = new Schema({
  tournamentName: {
    type: String,
    unique: true,
    required: true
  },
  city: String,
  address: String,
  owner: String,
  organizer: String,
  createdDate: Date,
  teams: {}

});

/**
 * Define model.
 */

mongoose.model('Tournament', TournamentSchema);