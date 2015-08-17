'use strict';

angular.module('angularPassportApp')
.controller('TeamCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, $http, $cookieStore, $modal) {

	$scope.player = [];
	$scope.roles = [{name:'Batsmen'},
	{name:'Bowler'},
	{name: 'All Rounder'}];

	$scope.roleSelected = $scope.roles[0];

	$scope.setRole = function () {
		console.log($scope.roleSelected);
	};

	$scope.confirmModal = false;

	$scope.confirmDelete = function(playerToDelete) {

		$scope.confirmModal = !$scope.confirmModal;

		$scope.playerToDelete = playerToDelete;

	};

	$scope.deletePlayer = function () {
		$scope.playerList.splice($scope.playerToDelete, 1); 
	};

	$scope.teamUpdate = function() {
		console.log($scope.playerList);

		teamService.update($scope.teamName, $scope.playerList).success(function(data) {
			$location.path("/team/" + data.data.teamName);
			$scope.playerList = data.data.players;
		}).error(function(status, data) {
			console.log(status);
			console.log(data);
		});

	};

	$scope.playerList = [];
	$scope.teamDetails = [];

	$scope.addPlayer = function (action) {
		if($scope.isCaptain) {
			$scope.captain = 'C';
		} else {
			$scope.captain = 'P';
		}
		$scope.playerList.push({
			firstName: $scope.firstName,
			lastName: $scope.lastName,
			role: $scope.roleSelected.name,
			captain: $scope.captain
		});
		if(action === 'U') {
			$scope.teamUpdate();
		} else {
			$scope.addTeam(); //save the added new players
		}

		$scope.firstName = "";
		$scope.lastName = "";
		$scope.isCaptain = false;
	};

	$scope.checkInputField = function () {
		if($scope.firstName.length > 1 && $scope.lastName.length > 1) {
			return true;
		} else {
			return false;
		}
	};

	$scope.getTeamDetails = function() {
		var teamName = $routeParams.teamName;
		if(teamName) {
			teamService.teamDetails(teamName).success(function(response) {
				$scope.players = response.exists;
				$scope.teamName = response.data.teamName;
				$scope.playerList = response.data.players;
			}).error(function(status, data) {
				console.log(status);
			});
		}
	}

	$scope.getTeamDetails();

	$scope.addTeam = function () {
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
			console.log(status);
			console.log(data);
		});
	};

	$scope.open = function () {

	    $scope.modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
	      templateUrl: 'delete.html',
	      size: size,
	      scope:$scope
	    });
  };

  $scope.close = function () {
  	$scope.modalInstance.dismiss('cancel');

  };

});