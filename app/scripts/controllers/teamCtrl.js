'use strict';

angular.module('howWasThat')
  .controller('TeamCtrl', function ($scope, teamService, $location, ProfileService, $routeParams, $rootScope, $http, $cookieStore, $modal, alertService, userService) {

    $scope.player = [];
    $scope.profileExists = false;
    $scope.roles = [{name: 'Batsmen'},
      {name: 'Bowler'},
      {name: 'All Rounder'}];

    $scope.roleSelected = $scope.roles[0];

    $scope.confirmModal = false;

    $scope.confirmDelete = function (playerToDelete) {
      $scope.confirmModal = !$scope.confirmModal;
      $scope.playerToDelete = playerToDelete;
    };

    $scope.checkProfileCreated = function () {
      ProfileService.findProfile($rootScope.currentUser.email).success(function (response) {
        $scope.profileExists = response.exists;
        $scope.user = response.data;
        $scope.organizer = $scope.user.firstname + ' ' + $scope.user.lastname;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error getting user details! Please try again.");
      });

    };

    $scope.checkProfileCreated();

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    $scope.userList = [];
    $scope.users = [];

    function createUserList(users) {
      users.forEach(function (user)    // check if the team is already added
      {
        var fullName = user.firstname + ' ' + user.lastname;
        $scope.userList.push({
          name: fullName,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email
        })
      });
    }

    function allUserAsPlayers() {
      userService.all().success(function (response) {
        $scope.users = response.data;
        createUserList($scope.users);
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });
    }

    allUserAsPlayers();

    $scope.deletePlayer = function () {
      $scope.modalInstance.dismiss('cancel');
      teamService.deletePlayer($scope.teamName, $scope.playerToDelete).success(function (data) {
        $location.path("/team/" + $scope.teamName);
        $scope.getTeamDetails();
        alertService.displaySaveMessage("Success");
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });
    };

    $scope.cloneToTeam = function (team, player) {
      $scope.modalInstance.dismiss('cancel');
      var resetPlayer = resetStats(player);
      teamService.clonePlayer(team.teamName, resetPlayer).success(function (data) {
        $location.path("/team/" + team.teamName);
        if(data.status === 'Not Found'){
          alertService.displayWarningMessage(data.statusText);
        } else {
          alertService.displaySaveMessage("Success");
        }
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });
    };

    function resetStats (player) {
      player.matches = Number(0);
      player.runs = Number(0);
      player.ballFaced = Number(0);
      player.wickets = Number(0);
      player.ballBowled =  Number(0);
      player.fifties = Number(0);
      player.hundreds = Number(0);
      player.fiveWicket = Number(0);
      return player;
    }

    $scope.teamUpdate = function () {
      alertService.clearLastToast();
      teamService.update($scope.teamName, $scope.newPlayer).success(function (data) {
        $location.path("/team/" + data.data.teamName);
        $scope.playerList = data.data.players;
        alertService.displaySaveMessage("Success");
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });

    };

    $scope.playerList = [];
    $scope.teamDetails = [];
    $scope.newPlayer = [];

    $scope.addPlayer = function (action) {
      var playerExists = false;
      $scope.newUser = true;
      if ($scope.isCaptain) {
        $scope.captain = 'C';
      } else {
        $scope.captain = 'P';
      }

      if (action === 'user') {
        $scope.firstName = $scope.player.firstName;
        $scope.lastName = $scope.player.lastName;
        $scope.email = $scope.player.email;
        $scope.newUser = false;
      }

      $scope.playerList.forEach(function (player) {
        if (player.email === $scope.email) {
          alertService.displayErrorMessage("Player already added to the team. Please add a different player");
          playerExists = true;
        }
      });

      if(!playerExists) {
        $scope.newPlayer.push({
          firstName: $scope.firstName,
          lastName: $scope.lastName,
          role: $scope.roleSelected.name,
          captain: $scope.captain,
          email: $scope.email,
          matches: Number(0),
          runs: Number(0),
          ballFaced: Number(0),
          wickets: Number(0),
          runsGiven: Number(0),
          ballBowled: Number(0),
          fifties: Number(0),
          hundreds: Number(0),
          fiveWicket: Number(0),
          newUser: $scope.newUser
        });

        $scope.playerList.push($scope.newPlayer[0]);

        if (action === 'U' || action === 'user') {
          $scope.teamUpdate();
        } else {
          $scope.addTeam(); //save the added new players
        }
      }

      $scope.firstName = "";
      $scope.lastName = "";
      $scope.email = "";
      $scope.isCaptain = false;
      $scope.newPlayer = [];
      $scope.player = "";
    };

    $scope.checkInputField = function () {
      return ($scope.firstName.length > 1 && $scope.lastName.length > 1);
    };

    $scope.getTeamDetails = function () {
      var teamName = $routeParams.teamName;
      if (teamName) {
        teamService.teamDetails(teamName).success(function (response) {
          $scope.players = response.exists;
          $scope.teamName = response.data.teamName;
          $scope.playerList = response.data.players;
          $scope.bestBatsman = _.max($scope.playerList, function(player){ return player.runs; });
          $scope.bestBowler = _.max($scope.playerList, function(player){ return player.wickets; });
          $scope.teamWins = response.data.won;
          $scope.teamGames = response.data.matches;
          $scope.teamLosses = response.data.lost;
          $scope.tournaments = response.data.tournaments;
        }).error(function (status, data) {
          alertService.displayErrorMessage("There was an error! Please try again");
        });
      }
    };

    $scope.getTeamDetails();

    $scope.addTeam = function () {
      var teamExists = false;
      $scope.allTeams.forEach(function (teams) {
        if (teams.teamName === $scope.teamName) {
          alertService.displayErrorMessage("Team Name already taken. Please choose a different name");
          teamExists = true;
        }
      });


      if (!teamExists) {
        var joiningDate = new Date();
        $scope.teamDetails.push({
          teamName: $scope.teamName,
          owner: $rootScope.currentUser.email,
          joiningDate: joiningDate,
          players: $scope.playerList
        });

        teamService.create($scope.teamDetails).success(function (data) {
          $location.path("/team/" + data.data.teamName);
          $scope.playerList = data.data.players;
        }).error(function (status, data) {
          alertService.displayErrorMessage("There was an error! Please try again");
        });
      }
    };

    function getAllTeams() {
      teamService.getTeams().success(function (response) {
        $scope.allTeams = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });

    }

    getAllTeams();

    $scope.open = function (player) {
      $scope.playerToDelete = player;
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'delete.html',
        scope: $scope
      });
    };

    $scope.clone = function (player) {
      $scope.playerToClone = player;
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'copyPlayer.html',
        scope: $scope
      });
    };

    $scope.profile = function (player) {
      $location.path('/profile/' + player.firstName + ' ' + player.lastName);
    }

    $scope.close = function () {
      $scope.modalInstance.dismiss('cancel');
    };

  });
