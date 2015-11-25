'use strict';

angular.module('howWasThat')
.factory('ProfileService', function($http) {
	return {
		create: function(user) {
			return $http.post(options.api.base_url + '/api/profile', {'user': user});
		},
		update: function(user) {
			return $http.put(options.api.base_url + '/api/profile/update', {'user': user});
		},
		findProfile: function(user) {
			return $http.get(options.api.base_url  + '/api/profile/' + user);
		},
		getUserEmail: function(userId) {
    	return $http.get(options.api.base_url  + '/api/profile/email/' + userId);
    }
	};
});



