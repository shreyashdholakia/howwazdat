'use strict';

angular.module('howWasThat')
  .controller('ProfileCtrl', function ($scope, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, matchDetailsService, alertService, statisticService) {

    $scope.isProfileCreated = false;
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.numberOfPages = function () {
      return Math.ceil($scope.matches.length / $scope.pageSize);
    };
    $scope.userProfile = false;

    function checkProfileCreated() {
      ProfileService.findProfile($rootScope.currentUser.email).success(function (response) {
        $scope.profileExists = response.exists;
        $scope.userProfile = true;
        $scope.user = response.data;
        $scope.fullName = $scope.user.firstname + ' ' + $scope.user.lastname;
        $scope.email = $rootScope.currentUser.email;
        getMatches($scope.fullName);
        getUserStatistics($scope.fullName);
        getUserTeams($scope.user.email);
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    function getProfile() {
      if($routeParams.player) {
        getPlayerUserName($routeParams.player);
      } else {
        checkProfileCreated($rootScope.currentUser.username)
      }
    }

    getProfile();
    //checkProfileCreated();

    function getPlayerUserName(name) {
      console.log("hre" + name);
    }

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
      $scope.email = $rootScope.currentUser.email;
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

    function getUserStatistics(name) {
      statisticService.userStatistics(name).success(function (response) {
        $scope.stats = response.data;
        extractUserStatistics($scope.stats, name);
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    function extractUserStatistics(stats, name) {
      var statistics = [];
      for (var i in stats) {
        var runs = _.where(stats[i].teams, {player: name});
        statistics.push(runs[0]);
      }
      $scope.playerRuns = 0;
      $scope.playerWickets = 0;
      $scope.playerGames = 0;

      _.each(statistics, function (item) {
        $scope.playerRuns += Number(item['runs']);
        $scope.playerWickets += Number(item['wickets']);
        $scope.playerGames += Number(item['matches']);
      });
    }

    function getUserTeams(name) {
      statisticService.userTeams(name).success(function (response) {
        $scope.playerTeams = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

  });



