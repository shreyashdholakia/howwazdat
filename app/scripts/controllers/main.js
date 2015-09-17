'use strict';

angular.module('angularPassportApp')
  .controller('MainCtrl', function ($scope, $rootScope, tournamentService, alertService, ProfileService) {


    $scope.checkProfileCreated = function () {
      ProfileService.findProfile($rootScope.currentUser.username).success(function(response) {
        $scope.profileExists = response.exists;
        $scope.user = response.data;
      }).error(function(status, data) {
        console.log(status);
      });

    };

    $scope.checkProfileCreated();

    function getTournamentList() {
      tournamentService.all().success(function (response) {
        $scope.tournamentList = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.n");
      });
    }

    getTournamentList();

  });
