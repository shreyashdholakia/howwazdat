'use strict';

angular.module('howWasThat')
.factory('teamService', function($http) {
	return {

		create: function(teamList) {
			return $http.post(options.api.base_url + '/api/team', {'team': teamList});
		},
		teamDetails: function(teamName) {
			return $http.get(options.api.base_url  + '/api/team/' + teamName);
		},
		update: function(teamName,teamList) {
			return $http.put(options.api.base_url  + '/api/team/' + teamName, {'team': teamList});
		},
		getTeams: function () {
			return $http.get(options.api.base_url + '/api/team');
		},
    deletePlayer: function (team, player) {
      return $http.put(options.api.base_url + '/api/team/player/' + team, {'player': player});
    },
    clonePlayer: function (team, player) {
      return $http.post(options.api.base_url + '/api/team/clone/player/' + team, {'player': player});
    }
	};
});
