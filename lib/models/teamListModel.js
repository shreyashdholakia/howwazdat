'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


var TeamListSchema = new Schema ({

  team: Schema.Types.Mixed

});

/**
 * Define model.
 */

mongoose.model('TeamsList', TeamListSchema);