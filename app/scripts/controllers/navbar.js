'use strict';

angular.module('angularPassportApp')
  .controller('NavbarCtrl', function ($scope, Auth, $location) {
    $scope.menu = [{
      "title": "Team",
      "link": "createTeam"
    }];

    $scope.authMenu = [
      {
        "title": "Tournaments",
        "link": "tournaments"
      }];

    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  });
