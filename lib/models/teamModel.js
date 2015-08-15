'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TeamSchema = new Schema({
  teamName: {
    type: String,
    unique: true,
    required: true
  },
  owner: String,
  joiningDate: Date,
  players: {}

});

/**
 * Define model.
 */

mongoose.model('Teams', TeamSchema);