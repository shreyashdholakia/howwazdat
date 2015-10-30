'use strict';

angular.module('howWasThat')
  .factory('statisticService', function($http) {
    return {
      userStatistics: function(user) {
        return $http.get(options.api.base_url + '/api/statistics/user/' + user);
      },
      userTeams: function(user) {
        return $http.post(options.api.base_url + '/api/user/teams/', {'user': user});
      }
    };
  });
