'use strict';

angular.module('angularPassportApp')
.controller('ProfileCtrl', function ($scope, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, matchDetailsService) {

  $scope.isProfileCreated = false;
  $scope.currentPage = 0;
  $scope.pageSize = 10;

  $scope.checkProfileCreated = function () {
    ProfileService.findProfile($rootScope.currentUser.username).success(function(response) {
      $scope.profileExists = response.exists;
      $scope.user = response.data;
      $scope.fullName = $scope.user.firstname + ' ' + $scope.user.lastname;
      getMatches($scope.fullName);
    }).error(function(status, data) {
      console.log(status);
    });

  };

  $scope.checkProfileCreated();

  function getMatches(fullName) {
      matchDetailsService.getUserMatches(fullName).success(function(response) {
            $scope.profileExists = response.exists;
            $scope.matches = response.data;
        console.log($scope.matches);
          }).error(function(status, data) {
            console.log(status);
          });
  }


  $scope.updateProfile = function(user) {

    if($scope.profileExists) {
      user.username = $rootScope.currentUser.username;
      user.updatedDate = new Date();
      ProfileService.update(user).success(function(data) {
        $location.path("/profile");
      }).error(function(status, data) {
        console.log(status);
      });
    } else {
      $scope.create(user);
    }
  };

  $scope.create = function(user) {
    console.log("here in create");
    user.username = $rootScope.currentUser.username;
    user.email = $rootScope.currentUser.email;
    user.joiningDate = new Date();

    ProfileService.create(user).success(function(data) {
      $location.path("/profile");
    }).error(function(status, data) {
      console.log(status);
      console.log(data);
    });
  };

  $scope.tab = "profile";
  $scope.isEmail = true;

  $scope.setTab = function(newTab){
    $scope.tab = newTab;
  };

  $scope.isActiveTab = function(tab){
    return $scope.tab === tab;
  };

});



