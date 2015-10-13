'use strict';

angular.module('howWasThat')
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });
