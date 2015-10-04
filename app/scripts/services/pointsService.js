'use strict';

angular.module('angularPassportApp')
  .factory('pointService', function($http) {
    return {
      pointsTable: function(tournament) {
        return $http.get(options.api.base_url + '/api/point/' + tournament);
      }

    };
  });
