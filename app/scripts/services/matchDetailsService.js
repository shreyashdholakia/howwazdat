'use strict';

angular.module('angularPassportApp')
  .factory('matchDetailsService', function($http) {
    return {

      match: function(tournament, matchNumber) {
        return $http.get(options.api.base_url + '/api/match/' + tournament + '/'+ matchNumber);
      },

      updateMatch:  function(tournamentName, matches) {
        return $http.post(options.api.base_url  + '/api/match/' + tournamentName, {'matches': matches});
      },

      findProfile: function(user) {
        return $http.get(options.api.base_url  + '/api/profile/' + user);
      }
    };
  });
