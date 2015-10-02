'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var PointsSchema = new Schema({
  tournament: {
    type: String,
    unique: true,
    required: true
  },
  teamStats:{}
});

/**
 * Define model.
 */

mongoose.model('PointsTable', PointsSchema);
