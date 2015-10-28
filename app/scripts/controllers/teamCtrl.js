'use strict';

angular.module('howWasThat')
.controller('TeamCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, $http, $cookieStore, $modal, alertService, userService) {

	$scope.player = [];
	$scope.roles = [{name:'Batsmen'},
	{name:'Bowler'},
	{name: 'All Rounder'}];

	$scope.roleSelected = $scope.roles[0];

	$scope.confirmModal = false;

	$scope.confirmDelete = function(playerToDelete) {

		$scope.confirmModal = !$scope.confirmModal;

		$scope.playerToDelete = playerToDelete;

	};

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
		var index = $scope.playerList.indexOf($scope.playerToDelete);
		$scope.playerList.splice(index, 1);
		$scope.teamUpdate();
	};

	$scope.teamUpdate = function() {
    alertService.clearLastToast();
		teamService.update($scope.teamName, $scope.newPlayer).success(function(data) {
			$location.path("/team/" + data.data.teamName);
			$scope.playerList = data.data.players;
			alertService.displaySaveMessage("Success");
		}).error(function(status, data) {
      alertService.displayErrorMessage("There was an error! Please try again");
		});

	};

	$scope.playerList = [];
	$scope.teamDetails = [];
  $scope.newPlayer = [];

	$scope.addPlayer = function (action) {
		if($scope.isCaptain) {
			$scope.captain = 'C';
		} else {
			$scope.captain = 'P';
		}

		if(action === 'user') {
		  $scope.firstName = $scope.player.firstName;
		  $scope.lastName = $scope.player.lastName;
		  $scope.email = $scope.player.email;
		}

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
      ballBowled: Number(0),
      fifties: Number(0),
      hundreds: Number(0),
      fiveWicket: Number(0)
    });

		$scope.playerList.push($scope.newPlayer[0]);

		if(action === 'U' || action === 'user') {
			$scope.teamUpdate();
		} else {
			$scope.addTeam(); //save the added new players
		}

		$scope.firstName = "";
		$scope.lastName = "";
		$scope.isCaptain = false;
    $scope.newPlayer = [];
	};

	$scope.checkInputField = function () {
		return ($scope.firstName.length > 1 && $scope.lastName.length > 1);
	};

	$scope.getTeamDetails = function() {
		var teamName = $routeParams.teamName;
		if(teamName) {
			teamService.teamDetails(teamName).success(function(response) {
				$scope.players = response.exists;
				$scope.teamName = response.data.teamName;
				$scope.playerList = response.data.players;
				$scope.teamWins = response.data.won;
				$scope.teamGames = response.data.matches;
				$scope.teamLosses = response.data.lost;
				$scope.tournaments = response.data.tournaments;
			}).error(function(status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
			});
		}
	};

	$scope.getTeamDetails();

	$scope.addTeam = function () {
	  var teamExists = false;
    $scope.allTeams.forEach(function (teams)
      {
        if(teams.teamName === $scope.teamName){
          alertService.displayErrorMessage("Team Name already taken. Please choose a different name");
          teamExists = true;
        }
      });


    if(!teamExists) {
      var joiningDate = new Date();
      $scope.teamDetails.push({
        teamName: $scope.teamName,
        owner: $rootScope.currentUser.username,
        joiningDate: joiningDate,
        players: $scope.playerList
      });

      teamService.create($scope.teamDetails).success(function(data) {
        $location.path("/team/" + data.data.teamName);
        $scope.playerList = data.data.players;
      }).error(function(status, data) {
        alertService.displayErrorMessage("There was an error! Please try again");
      });
		}
	};

	function getAllTeams() {
    teamService.getTeams().success(function(response) {
			$scope.allTeams = response.data;
		}).error(function(status, data) {
      alertService.displayErrorMessage("There was an error! Please try again");
		});

	}

	getAllTeams();

	$scope.open = function (player) {
		$scope.playerToDelete = player;
	    $scope.modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
	      templateUrl: 'delete.html',
	      scope:$scope
	    });
  };

  $scope.close = function () {
  	$scope.modalInstance.dismiss('cancel');
  };

});
