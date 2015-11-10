'use strict';

angular.module('howWasThat')
  .factory('matchDetailsService', function($http) {
    return {
      match: function(tournament, matchNumber) {
        return $http.get(options.api.base_url + '/api/match/' + tournament + '/'+ matchNumber);
      },
      updateMatch:  function(tournamentName, matches) {
        return $http.post(options.api.base_url  + '/api/match/' + tournamentName, {'matches': matches});
      },
      updateMatchScores:  function(tournamentName, matches) {
        return $http.put(options.api.base_url  + '/api/match/' + tournamentName, {'matches': matches});
      },
      findProfile: function(user) {
        return $http.get(options.api.base_url  + '/api/profile/' + user);
      },
      getUserMatches: function(player) {
        return $http.post(options.api.base_url  + '/api/match', {'playerName': player})
      },
      submitMatch: function(tournamentName, matches) {
        return $http.post(options.api.base_url  + '/api/match/review/' + tournamentName, {'matches': matches});
      },
      updatePlayerScore: function(team, scores) {
        return $http.post(options.api.base_url  + '/api/match/update/batting/' + team, {'scores': scores});
      }


    };
  });
