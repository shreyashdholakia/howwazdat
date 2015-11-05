'use strict';

angular.module('howWasThat')
  .controller('MainCtrl', function ($scope, $rootScope, tournamentService, alertService, ProfileService, teamService) {

    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.numberOfPages = function () {
      return Math.ceil($scope.tournamentList.length / $scope.pageSize);
    };

    function checkProfileCreated () {
      ProfileService.findProfile($rootScope.currentUser.email).success(function(response) {
        $scope.profileExists = response.exists;
        $scope.user = response.data;
      }).error(function(status, data) {
        console.log(status);
      });
    }

    function getTournamentList() {
      tournamentService.all().success(function (response) {
        $scope.tournamentList = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.n");
      });
    }

    function getAllTeams() {
      teamService.getTeams().success(function (response) {
        $scope.allTeams = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });
    }

    checkProfileCreated();
    getAllTeams();
    getTournamentList();

  });
