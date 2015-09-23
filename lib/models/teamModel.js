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
  players: {},
  matches: { type: Number, default: 0 },
  won: [],
  lost: [],
  tournaments: []
});

//TeamSchema.plugin(autoIncrement.plugin, { model: 'TeamSchema', field: 'matches' });

/**
 * Define model.
 */

mongoose.model('Teams', TeamSchema);
