'use strict';

angular.module('howWasThat')
  .controller('NavbarCtrl', function ($scope, Auth, $location) {
    $scope.menu = [{
      "title": "Team",
      "link": "createTeam"
    }];

    $scope.authMenu = [
      {
        "title": "Tournaments",
        "link": "tournaments"
      },
      {
        "title": "Teams",
        "link": "teams"
      }];

    $scope.logout = function() {
      Auth.logout(function(err) {
        if(!err) {
          $location.path('/login');
        }
      });
    };
  });
