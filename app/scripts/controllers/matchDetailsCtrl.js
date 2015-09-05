'use strict';

angular.module('angularPassportApp')
  .controller('matchDetailsCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, matchDetailsService, $cookieStore, $modal, alertService) {

    $scope.matchDetails = true;

    $scope.umpires = [{name: 'Self'},
      {name: 'Neutral'}];

    $scope.outs = [
      {name: 'Catch Out'},
      {name: 'Stumped'},
      {name: 'Bowled'},
      {name: 'LBW'},
      {name: 'Hit Wicket'},
      {name: 'Run Out'},
      {name: 'Retired'},
      {name: 'Handled the ball'},
      {name: 'Hit the ball twice'},
      {name: 'Not Out'},
      {name: 'Did not bat'},
      {name: 'Obstructing the field'},
      {name: 'Timed out'}
    ];

    $scope.howOut = $scope.outs[9];

    $scope.playerList = [];
    $scope.visitingTeamPlayerList = [];

    $scope.homeTeam = getTeamDetails('Sixers');
    $scope.visitingTeam = getVisitingTeamDetails('Mavericks');

    function homeTeamPlayers(players) {
      players.forEach(function (player)    // check if the team is already added
      {
        var fullName = player.firstName + ' ' + player.lastName;
        $scope.playerList.push({
          name: fullName
        })
      });
    }

    function visitingTeamPlayers(players) {
      players.forEach(function (player)    // check if the team is already added
      {
        var fullName = player.firstName + ' ' + player.lastName;
        $scope.visitingTeamPlayerList.push({
          name: fullName
        })
      });
    }

    $scope.players = [];


    function getTeamDetails(teamName) {
      if (teamName) {
        teamService.teamDetails(teamName).success(function (response) {
          $scope.players = response.data.players;
          $scope.teamName = response.data.teamName;
          homeTeamPlayers($scope.players);
        }).error(function (status, data) {
          console.log(status);
        });
      }
    }

    function getVisitingTeamDetails(teamName) {
      if (teamName) {
        teamService.teamDetails(teamName).success(function (response) {
          $scope.players = response.data.players;
          $scope.teamName = response.data.teamName;
          visitingTeamPlayers($scope.players);
        }).error(function (status, data) {
          console.log(status);
        });
      }
    }

    function calculateStrikeRate(runs, balls) {
    return ((runs * 100) / balls);
    }

    $scope.homeTeamBattingDetails = [];
    $scope.visitingTeamFielder = [];
    $scope.visitingTeamBowler = [];
    var playerExists = false;
    $scope.addHomeTeamBatting = function () {
      var playerExists = false;
      $scope.homeTeamBattingDetails.forEach(function (playerInfo)    // check if the team is already added
            {
              if (playerInfo.player === $scope.homeTeamPlayer.name) {
                alertService.displayErrorMessage("Player already added..");
                playerExists = true;

              }
            });

      if(!playerExists) {
//        if(!$scope.visitingTeamFielder) {
//          $scope.visitingTeamFielder.name = ' ';
//        }
        $scope.homeTeamBattingDetails.push({
          player: $scope.homeTeamPlayer.name,
          outNotOut: $scope.howOut.name || 'Not Out',
          fielder: $scope.visitingTeamFielder.name || '--',
          bowler: $scope.visitingTeamBowler.name || '--',
          runs: $scope.runs || 0,
          balls: $scope.balls || 0,
          fours: $scope.fours || 0,
          sixes: $scope.sixes || 0,
          strikeRate: calculateStrikeRate($scope.runs, $scope.balls)
        });

        resetAddPlayerForm();
      } else {
        resetAddPlayerForm();
      }

    };

    function resetAddPlayerForm() {
      $scope.homeTeamPlayer = "";
      $scope.howOut = $scope.outs[9];
      $scope.visitingTeamFielder = "";
      $scope.visitingTeamBowler = "";
      $scope.runs = "";
      $scope.balls = "";
      $scope.fours = "";
      $scope.sixes = "";
    }

  });
