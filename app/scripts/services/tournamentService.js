'use strict';

angular.module('angularPassportApp')
.factory('tournamentService', function($http) {
	return {

		create: function(tournamentDetails) {
			return $http.post(options.api.base_url + '/api/tournament', {'tournament': tournamentDetails});
		},
		tournamentDetails: function(tournamentName) {
			return $http.get(options.api.base_url  + '/api/tournament/' + tournamentName);
		},
		update: function(teamName,teamList) {
			return $http.put(options.api.base_url  + '/api/team/' + teamName, {'team': teamList});
		},
		addTeams: function(teams, tournamentName) {
			return $http.put(options.api.base_url  + '/api/tournament/' + tournamentName, {'teams': teams});
		},
		createMatch: function(tournamentName, matchDetails) {
			return $http.put(options.api.base_url  + '/api/tournament/match/' + tournamentName, {'matches': matchDetails})
		},
    all: function() {
      return $http.get(options.api.base_url  + '/api/tournaments')
    }
	};
});
