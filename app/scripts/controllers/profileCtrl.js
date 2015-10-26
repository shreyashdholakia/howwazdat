'use strict';

angular.module('howWasThat')
  .controller('ProfileCtrl', function ($scope, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, matchDetailsService, alertService) {

    $scope.isProfileCreated = false;
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.userProfile = false;
    $scope.email = $rootScope.currentUser.email;

    $scope.checkProfileCreated = function () {
      ProfileService.findProfile($rootScope.currentUser.username).success(function (response) {
        $scope.profileExists = response.exists;
        $scope.userProfile = true;
        $scope.user = response.data;
        $scope.fullName = $scope.user.firstname + ' ' + $scope.user.lastname;
        getMatches($scope.fullName);
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    };

    $scope.checkProfileCreated();

    function getMatches(fullName) {
      matchDetailsService.getUserMatches(fullName).success(function (response) {
        $scope.matches = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    $scope.updateProfile = function (user) {
      if ($scope.profileExists) {
        user.username = $rootScope.currentUser.username;
        user.updatedDate = new Date();
        ProfileService.update(user).success(function (data) {
          $scope.userProfile = true;
          alertService.displaySaveMessage("Profile Successfully updated");
          $location.path("/profile");
        }).error(function (status, data) {
          alertService.displayErrorMessage("There was an error! Please try again.");
        });
      } else {
        $scope.create(user);
      }
    };

    $scope.create = function (user) {
      user.username = $rootScope.currentUser.username;
      user.email = $scope.email;
      user.joiningDate = new Date();

      ProfileService.create(user).success(function (data) {
        $scope.userProfile = true;
        alertService.displaySaveMessage("Profile Successfully created");
        $location.path("/profile");
      }).error(function (status, data) {
        console.log(status);
        console.log(data);
      });
    };

    $scope.tab = "profile";
    $scope.isEmail = true;

    $scope.setTab = function (newTab) {
      $scope.tab = newTab;
    };

    $scope.isActiveTab = function (tab) {
      return $scope.tab === tab;
    };

  });



