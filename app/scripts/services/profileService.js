'use strict';

angular.module('angularPassportApp')
.factory('ProfileService', function($http) {
	return {

		create: function(user) {
			return $http.post(options.api.base_url + '/api/profile', {'user': user});
		},

		update: function(user) {
			return $http.put(options.api.base_url + '/api/profile/' + user.username, {'user': user});
		},

		findProfile: function(user) {
			return $http.get(options.api.base_url  + '/api/profile/' + user);
		}
	};
});



