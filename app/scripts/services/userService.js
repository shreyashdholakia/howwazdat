'use strict';

angular.module('angularPassportApp')
.factory('userService', function($http) {
	return {

		create: function(teamList) {
			return $http.post(options.api.base_url + '/api/team', {'team': teamList});
		},
		all: function() {
			return $http.get(options.api.base_url  + '/api/users');
		},
		update: function(teamName,teamList) {
			return $http.put(options.api.base_url  + '/api/team/' + teamName, {'team': teamList});
		},
		getTeams: function () {
			return $http.get(options.api.base_url + '/api/team');
		}
	};
});
