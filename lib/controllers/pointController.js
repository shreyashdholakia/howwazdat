'use strict';

var mongoose = require('mongoose'),
    Points = mongoose.model('PointsTable');


exports.show = function (req, res) {
  var tournament = req.params.tournament;
  Points.findOne({ tournament : tournament }, function (err, pointTable) {
    if (err) {
      return next(new Error('Failed to tournament ' + tournament));
    }

    if(pointTable) {
      res.json({exists: true, data: pointTable});
    } else {
      res.json({exists: false});
    }
  });
}
