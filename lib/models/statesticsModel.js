'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var StatisticsSchema = new Schema({
  tournament: {
    type: String,
    unique: true,
    required: true
  },
  teams: []
});

/**
 * Define model.
 */

mongoose.model('Statistics', StatisticsSchema);
