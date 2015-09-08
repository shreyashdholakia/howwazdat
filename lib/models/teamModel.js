'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection("mongodb://localhost/test");

autoIncrement.initialize(connection);

var TeamSchema = new Schema({
  teamName: {
    type: String,
    unique: true,
    required: true
  },
  owner: String,
  joiningDate: Date,
  players: {},
  matches: Number,
  won: Number,
  lost: Number
});

TeamSchema.plugin(autoIncrement.plugin, { model: 'TeamSchema', field: 'matches' });

/**
 * Define model.
 */

mongoose.model('Teams', TeamSchema);
