'use strict';

angular.module('angularPassportApp')
.controller('tournamentCtrl', function ($scope, tournamentService, teamService, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, alertService) {

  $scope.isProfileCreated = false;
  $scope.checkProfileCreated = function () {
    ProfileService.findProfile($rootScope.currentUser.username).success(function(response) {
      $scope.profileExists = response.exists;
      $scope.user = response.data;
    }).error(function(status, data) {
      console.log(status);
    });

  };

  $scope.tournamentPage = ($routeParams.tournamentName) ? true : false;

  $scope.checkProfileCreated();
  $scope.tournamentDetails = [];

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

  $scope.getTournamentDetails = function() {
    var tournamentName = $routeParams.tournamentName;
    if(tournamentName) {
      tournamentService.tournamentDetails(tournamentName).success(function(response) {
        if(response.exists) {
        $scope.tournamentExists = response.exists;
        if(response.data.teams) {
          $scope.tournamentTeams = response.data.teams;
        }
        
        $scope.tournamentInfo = response.data;
        } else {
         $location.path("/createTournament");
        }
      }).error(function(status, data) {
        console.log(status);
      });
    } else {
      $location.path("/createTournament");

    }
  }

  function getTeamList() {
    teamService.getTeams().success(function(response) {
     $scope.teamList = response.data;
   }).error(function(status, data) {
    console.log(status);
  });

 }

   getTeamList();
   $scope.tournamentTeams = [];

   $scope.addTeamToTournament = function (team) {
    alertService.clearLastToast();
    var teamExists = false;
    if(team.players) {
      team.players.forEach( function (playerInfo) // Check the captain of the team and set it
      {
        if (playerInfo.captain === 'C') {
          $scope.captain = playerInfo.firstName + ' ' + playerInfo.lastName;
        }
      });
    }

    $scope.tournamentTeams.forEach( function (playerInfo)    // check if the team is already added
      {
        if (playerInfo.teamName === team.teamName) {
          alertService.displayErrorMessage("Team already playing");
          teamExists = true;

        }
      });

    if(!teamExists) {   // if team already added skip else add the team
      $scope.tournamentTeams.push ({
        teamName: team.teamName,
        captain: $scope.captain || '--'
      });
      $scope.saveTeams($scope.tournamentTeams);
    }

    // alertService.displaySaveMessage("Teams Added");
  };

  $scope.saveTeams = function (teams) {
    tournamentService.addTeams(teams, $scope.tournamentInfo.tournamentName).success(function(response) {
      $location.path("/tournament/" + response.data.tournamentName);
      $scope.tournamentName = response.data.tournamentName;
      $scope.tournamentTeams = response.data.teams;
      $scope.tournamentPage = true;
      alertService.displaySaveMessage(" Team Added");
    }).error(function(status, data) {
      alertService.displayErrorMessage("Error: Please try again!");
    });

  };



  $scope.getTournamentDetails();

  $scope.createTournament = function(tournament) {
    var joiningDate = new Date();
    $scope.tournamentDetails.push({
      tournamentName: $scope.tournament.name,
      organizer: $scope.tournament.organizer,
      owner: $scope.user.email,
      createdDate: joiningDate,
      city: $scope.tournament.city,
      address: $scope.tournament.address
    });

    tournamentService.create($scope.tournamentDetails).success(function(data) {
      $location.path("/tournament/" + data.data.tournamentName);
      $scope.tournamentName = data.data.tournamentName;
      $scope.tournamentPage = true;
    }).error(function(status, data) {
      console.log(data);
    });
  };

  $scope.tab = "teams";
  $scope.isEmail = true;

  $scope.setTab = function(newTab){
    $scope.tab = newTab;
  };

  $scope.isActiveTab = function(tab){
    return $scope.tab === tab;
  };

});



