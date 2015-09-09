'use strict';

angular.module('angularPassportApp')
  .controller('matchDetailsCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, matchDetailsService, $cookieStore, tournamentService, alertService) {

    $scope.matchDetails = true;

    $scope.umpires = [{name: 'Self'},
      {name: 'Neutral'}];
     $scope.decisions = [{name: 'Batting'},
      {name: 'Bowling'}];

    $scope.urlParams = $location.search();
    $scope.editMatchStatus = false;

    $scope.tournamentName = $routeParams.tournamentName;
    $scope.matchNumber = $routeParams.matchNumber;

    function getMatchDetails() {
      matchDetailsService.match($scope.tournamentName, $scope.matchNumber).success(function (response) {
       $scope.matchDetails = response.data;
       if($scope.matchDetails.status) {
         $scope.editMatchStatus = true;
       }
       createTeamDropDown($scope.matchDetails);
       $scope.homeTeam = getTeamDetails($scope.matchDetails.homeTeam);
       $scope.visitingTeam = getVisitingTeamDetails($scope.matchDetails.visitingTeam);
         }).error(function (status, data) {
          alertService.displayErrorMessage("There was an error! Please try again.");
       });
    }

    function getTournamentDetails () {
      tournamentService.tournamentDetails($scope.tournamentName).success(function (response) {
        $scope.tournamentMatches  = response.data.matches;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    getMatchDetails();
    getTournamentDetails();
    $scope.teams = [];

    function createTeamDropDown(matchDetails) {
      $scope.teams.push({name:matchDetails.homeTeam});
      $scope.teams.push({name:matchDetails.visitingTeam});
    }

    $scope.manOfMatch = [];

    function createManOfMatch(players) {
       players.forEach(function (player)
       {
           $scope.manOfMatch.push(
           player
         )
       });
    }

    $scope.outs = [
      {name: 'Catch Out'},
      {name: 'Caught Behind'},
      {name: 'Caught And Bowled'},
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

    $scope.outMaps = {
                    Catch_Out: 'C',
                    Caught_Behind: 'cb',
                    Caught_And_Bowled: 'c & b',
                    Stumped: 'st',
                    Bowled: 'B',
                    LBW: 'lbw',
                    Hit_Wicket: 'hit wicket',
                    Run_Out: 'ro',
                    Retired: 'retired',
                    Handled_the_ball: 'handled the ball',
                    Hit_the_ball_twice: 'hit the ball twice',
                    Not_Out: 'not out',
                    Did_not_bat: 'dnb',
                    Obstructing_the_field: 'obstructing the field',
                    Timed_out: 'timed out'
                };

    $scope.howOut = $scope.outs[9];

    $scope.playerList = [];
    $scope.visitingTeamPlayerList = [];

    function homeTeamPlayers(players) {
      players.forEach(function (player)    // check if the team is already added
      {
        var fullName = player.firstName + ' ' + player.lastName;
        $scope.playerList.push({
          name: fullName
        })
      });
      createManOfMatch($scope.playerList);
    }

    function visitingTeamPlayers(players) {
      players.forEach(function (player)    // check if the team is already added
      {
        var fullName = player.firstName + ' ' + player.lastName;
        $scope.visitingTeamPlayerList.push({
          name: fullName
        })
      });
      createManOfMatch($scope.visitingTeamPlayerList);
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

    function createHowOut(outStyle, fielder, bowler) {
      var out;
      console.log(outStyle.split(' ').join('_'));
      if(fielder || bowler) {
        if(outStyle === 'Bowled' || outStyle === 'Caught And Bowled') {
          out = $scope.outMaps[outStyle.split(' ').join('_')] + ' ' + bowler;
        } else {
          out = $scope.outMaps[outStyle.split(' ').join('_')] + ' ' + fielder + ' b' + ' ' + bowler;
        }

      } else {
        out = $scope.outMaps[outStyle.split(' ').join('_')];
      }
      return out;
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
        $scope.homeTeamBattingDetails.push({
          player: $scope.homeTeamPlayer.name,
          outNotOut: createHowOut($scope.howOut.name, $scope.visitingTeamFielder.name, $scope.visitingTeamBowler.name),
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
      $scope.howOut = $scope.outs[10];
      $scope.visitingTeamFielder = "";
      $scope.visitingTeamBowler = "";
      $scope.runs = "";
      $scope.balls = "";
      $scope.fours = "";
      $scope.sixes = "";
    }

    $scope.matches = [];

    $scope.update = function () { // update the game info
      $scope.tournamentMatches.forEach(function (match)
      {
        if (match.matchNumber === $scope.matchNumber) {
            match.toss = $scope.toss.name;
            match.winningTeam = $scope.winningTeam.name;
            match.tossDecision = $scope.decision.name;
            match.mom = $scope.mom.name;
            match.status = 'Submitted';
            $scope.match = match;
        }
      });

      $scope.matches.push(
        {all:$scope.tournamentMatches,
          single: $scope.match}
      );

      matchDetailsService.updateMatch($scope.tournamentName, $scope.matches).success(function (response) {
        getMatchDetails();
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    };


  });
