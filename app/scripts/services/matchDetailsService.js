'use strict';

angular.module('angularPassportApp')
  .factory('matchDetailsService', function($http) {
    return {

      match: function(tournament, matchNumber) {
        return $http.get(options.api.base_url + '/api/match/' + tournament + '/'+ matchNumber);
      },

      update: function(user) {
        return $http.put(options.api.base_url + '/api/profile/' + user.username, {'user': user});
      },

      findProfile: function(user) {
        return $http.get(options.api.base_url  + '/api/profile/' + user);
      }
    };
  });
