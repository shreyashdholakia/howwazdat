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
  updatedBy: String,
  lastUpdated: Date,
  players: [],
  matches: { type: Number, default: 0 },
  teamNumber: { type: Number, default: 0 },
  won: [],
  lost: [],
  tournaments: [],
  tie: [],
  teamPicture: { data: Buffer, contentType: String }
});

//TeamSchema.plugin(autoIncrement.plugin, { model: 'TeamSchema', field: 'matches' });

/**
 * Define model.
 */

mongoose.model('Teams', TeamSchema);
