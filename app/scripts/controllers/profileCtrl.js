'use strict';

angular.module('howWasThat')
  .controller('ProfileCtrl', function ($scope, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, matchDetailsService, alertService, statisticService, $fileUploader) {

    $scope.isProfileCreated = false;
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.numberOfPages = function () {
      return Math.ceil($scope.matches.length / $scope.pageSize);
    };
    $scope.userProfile = false;
    $scope.userLoaded = false;


    function checkProfileCreated(user) {
      ProfileService.findProfile(user).success(function (response) {
        $scope.profileExists = response.exists;
        $scope.user = response.data;
        $scope.userLoaded = true;
        if(response.data) {
          $scope.userProfile = (response.data.firstname && response.data.lastname) ? true : false;
          $scope.fullName = $scope.user.firstname + ' ' + $scope.user.lastname;
          $scope.userLoaded = true;
          getMatches($scope.fullName);
          getUserStatistics($scope.user.email);
          getUserTeams($scope.user.email);
        }
        $scope.email = $rootScope.currentUser.email;
        if(response.image) {
          $scope.image = response.image;
          $scope.imageContentType = response.data.avatar.contentType || 'image/jpeg';
        }

      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    function getProfile() {
      if($routeParams.player) {
        getPlayerEmail($routeParams.player);
      } else {
        checkProfileCreated($rootScope.currentUser.email)
      }
    }

    getProfile();

    function getPlayerEmail(userID) {
      ProfileService.getUserEmail(userID).success(function (response) {
        if(response.data) {
          checkProfileCreated(response.data);
        } else {
          alertService.displayErrorMessage("There was an error! Please try again.");
        }
      });
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
            alertService.displaySaveMessage("Profile Successfully updated");
            getProfile();
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
        if(item) {
          $scope.playerRuns += Number(item['runs']);
          $scope.playerWickets += Number(item['wickets']);
          $scope.playerGames += Number(item['matches']);
        }
      });
    }

    function getUserTeams(name) {
      statisticService.userTeams(name).success(function (response) {
        $scope.playerTeams = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    var imageURL = '/api/profile/image/'+ $rootScope.currentUser.email;
    // create a uploader with options
    var uploader = $scope.uploader = $fileUploader.create({
      scope: $scope,                          // to automatically update the html. Default: $rootScope
      url: imageURL ,
      formData: [
        { file: null }
      ],
      removeAfterUpload: true,
      queueLimit: 1,
      filters: [
        function (item) {                    // first user filter
          return true;
        }
      ]
    });

    uploader.allowNewFiles = true;

    // FILTERS
    uploader.filters.push(function() {
      return uploader.queue.length !== 1; // only one file in the queue
    });

    uploader.bind('success', function (event, xhr, item, response) {
      alertService.clearLastToast();
      uploader.clearQueue();
      if(response.message) {
        alertService.displayErrorMessage(response.message);
      } else {
        alertService.displaySaveMessage("Profile Successfully created");
        $("#upload-file-info").value = null;
        getProfile();

      }
    });

    uploader.onCompleteItem  = function(item, response, status, headers) {
      uploader.clearQueue();
    };

    uploader.bind('beforeupload', function (event, item) {
       return true;
    });

    $scope.updateImage = function () {
      if (uploader.queue.length === 1) {
        alertService.displayLoadingMessage('Adding attachment...');
        uploader.uploadAll();
      }
    };

  });



