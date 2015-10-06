'use strict';

angular.module('angularPassportApp')
  .controller('matchDetailsCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, matchDetailsService, $cookieStore, tournamentService, alertService, $modal) {

    $scope.matchDetails = true;

    $scope.umpires = [{name: 'Self'},
      {name: 'Neutral'}];
    $scope.decisions = [{name: 'Batting'},
      {name: 'Bowling'}];
    $scope.tossInfo = [];

    $scope.urlParams = $location.search();
    $scope.editMatchStatus = false;

    $scope.tournamentName = $routeParams.tournamentName;
    $scope.matchNumber = $routeParams.matchNumber;

    function getMatchDetails(status) {
      matchDetailsService.match($scope.tournamentName, $scope.matchNumber).success(function (response) {
        $scope.matchDetails = response.data;
        if(status === 'new') {
          createTeamDropDown($scope.matchDetails);
          createMatchResults();
          $scope.homeTeam = getTeamDetails($scope.matchDetails.homeTeam);
          $scope.visitingTeam = getVisitingTeamDetails($scope.matchDetails.visitingTeam);
        }
        if ($scope.matchDetails.homeTeamBatting) {
          $scope.homeTeamBattingDetails = $scope.matchDetails.homeTeamBatting[0].battingScores;
        }

        if ($scope.matchDetails.visitingTeamBatting) {
          $scope.visitingTeamBattingDetails = $scope.matchDetails.visitingTeamBatting[0].battingScores;
        }

        if ($scope.matchDetails.visitingTeamBowling) {
          $scope.visitingTeamBowlingDetails = $scope.matchDetails.visitingTeamBowling[0].bowlingCard;
        }
        if ($scope.matchDetails.homeTeamBowling) {
          $scope.homeTeamBowlingDetails = $scope.matchDetails.homeTeamBowling[0].bowlingCard;
        }
        if ($scope.matchDetails.status) {
          $scope.editMatchStatus = true;
          $scope.tossInfo.push({name: $scope.matchDetails.toss, id: 1});
          $scope.toss = $scope.tossInfo[0];
        }

        if ($scope.matchDetails.homeTeamTotal.length > 0) {
          $scope.homeTeamRuns = $scope.matchDetails.homeTeamTotal[0].total;
          $scope.homeTeamOvers = $scope.matchDetails.homeTeamTotal[0].overs;
          $scope.homeTeamWickets = $scope.matchDetails.homeTeamTotal[0].wickets;
          $scope.homeTeamWides = $scope.matchDetails.homeTeamTotal[0].wides;
          $scope.homeTeamNoBalls = $scope.matchDetails.homeTeamTotal[0].noBalls;
          $scope.homeTeamByes = $scope.matchDetails.homeTeamTotal[0].byes;
          $scope.homeTeamLegByes = $scope.matchDetails.homeTeamTotal[0].legByes;
          $scope.homeTeamRunRate = $scope.homeTeamRuns / $scope.homeTeamOvers;
        }

        if ($scope.matchDetails.visitingTeamTotal.length > 0) {
          $scope.visitingTeamRuns = $scope.matchDetails.visitingTeamTotal[0].total;
          $scope.visitingTeamOvers = $scope.matchDetails.visitingTeamTotal[0].overs;
          $scope.visitingTeamWickets = $scope.matchDetails.visitingTeamTotal[0].wickets;
          $scope.visitingTeamWides = $scope.matchDetails.visitingTeamTotal[0].wides;
          $scope.visitingTeamNoBalls = $scope.matchDetails.visitingTeamTotal[0].noBalls;
          $scope.visitingTeamByes = $scope.matchDetails.visitingTeamTotal[0].byes;
          $scope.visitingTeamLegByes = $scope.matchDetails.visitingTeamTotal[0].legByes;
          $scope.visitingTeamRunRate = $scope.visitingTeamRuns / $scope.visitingTeamOvers;
        }

      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    function getTournamentDetails() {
      tournamentService.tournamentDetails($scope.tournamentName).success(function (response) {
        $scope.tournamentMatches = response.data.matches;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    getMatchDetails('new');
    getTournamentDetails();
    $scope.teams = [];
    $scope.matchResults = [];

    function createMatchResults() {
      $scope.matchResults.push({name: 'Completed'});
      $scope.matchResults.push({name: 'Tie'});
      $scope.matchResults.push({name: 'Washed Out'});
      $scope.matchResults.push({name: 'Abandoned'});
    }

    function createTeamDropDown(matchDetails) {
      $scope.teams.push({name: matchDetails.homeTeam});
      $scope.teams.push({name: matchDetails.visitingTeam});
    }
    $scope.manOfMatch = [];

    function createManOfMatch(players) {
      players.forEach(function (player) {
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

    $scope.howOut = $scope.outs[11];
    $scope.howOutTeam2 = $scope.outs[11];

    $scope.playerList = [];
    $scope.visitingTeamPlayerList = [];

    function homeTeamPlayers(players) {
      players.forEach(function (player) {
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

    function calculateBowlingEconomy(runs, overs) {
      return (runs / overs);
    }

    function createHowOut(outStyle, fielder, bowler) {
      var out;
      if (fielder || bowler) {
        if (outStyle === 'Bowled' || outStyle === 'Caught And Bowled' || outStyle === 'LBW') {
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
    $scope.visitingTeamBattingDetails = [];
    $scope.visitingTeamFielder = [];
    $scope.visitingTeamBowler = [];
    $scope.homeTeamBowler = [];
    $scope.homeTeamFielder = [];

    $scope.visitingTeamBowlingDetails = [];
    $scope.homeTeamBowlingDetails = [];
    $scope.visitingTeamBowlingScores = [];
    $scope.homeTeamBowlingScores = [];


    $scope.addHomeTeamBatting = function () {
      var playerExists = false;
      $scope.homeTeamBattingDetails.forEach(function (playerInfo)    // check if the team is already added
      {
        if (playerInfo.player === $scope.visitingTeamPlayer.name) {
          alertService.displayErrorMessage("Player already added..");
          playerExists = true;

        }
      });

      if (!playerExists) {
        $scope.homeTeamBattingDetails.push({
          player: $scope.visitingTeamPlayer.name,
          outNotOut: createHowOut($scope.howOut.name, $scope.visitingTeamFielder.name, $scope.visitingTeamBowler.name),
          fielder: $scope.visitingTeamFielder.name || '--',
          bowler: $scope.visitingTeamBowler.name || '--',
          runs: $scope.runs || 0,
          balls: $scope.balls || 0,
          fours: $scope.fours || 0,
          sixes: $scope.sixes || 0,
          strikeRate: calculateStrikeRate($scope.runs, $scope.balls)
        });

        addBattingToTournament($scope.homeTeamBattingDetails, 'home');

        resetAddPlayerForm();
      } else {
        resetAddPlayerForm();
      }

    };

    $scope.addVisitingTeamBatting = function () {
      var playerExists = false;
      $scope.visitingTeamBattingDetails.forEach(function (playerInfo) {
        if (playerInfo.player === $scope.homeTeamPlayer.name) {
          alertService.displayErrorMessage("Player already added..");
          playerExists = true;

        }
      });

      if (!playerExists) {
        $scope.visitingTeamBattingDetails.push({
          player: $scope.homeTeamPlayer.name,
          outNotOut: createHowOut($scope.howOutTeam2.name, $scope.homeTeamFielder.name, $scope.homeTeamBowler.name),
          fielder: $scope.homeTeamFielder.name || '--',
          bowler: $scope.homeTeamBowler.name || '--',
          runs: $scope.runsTeam2 || 0,
          balls: $scope.ballsTeam2 || 0,
          fours: $scope.foursTeam2 || 0,
          sixes: $scope.sixesTeam2 || 0,
          strikeRate: calculateStrikeRate($scope.runsTeam2, $scope.ballsTeam2)
        });

        addBattingToTournament($scope.visitingTeamBattingDetails, 'visiting');

        resetAddPlayerForm();
      } else {
        resetAddPlayerForm();
      }

    };

    $scope.addVisingTeamBowlingDetails = function () {

      var playerExists = false;
      $scope.visitingTeamBowlingDetails.forEach(function (playerInfo)    // check if the team is already added
      {
        if (playerInfo.player === $scope.visitingTeamBowler.name) {
          alertService.displayErrorMessage("Bowler already added..");
          playerExists = true;
        }
      });

      if (!playerExists) {
        $scope.visitingTeamBowlingDetails.push({
          player: $scope.visitingTeamBowler.name,
          overs: $scope.visitingTeamBowlerOvers || 0,
          maiden: $scope.visitingTeamBowlerMaiden || 0,
          runs: $scope.visitingTeamBowlerRuns || 0,
          wickets: $scope.visitingTeamBowlerWickets || 0,
          econ: calculateBowlingEconomy($scope.visitingTeamBowlerRuns, $scope.visitingTeamBowlerOvers)
        });

        addBowlingToTournament($scope.visitingTeamBowlingDetails, 'visiting');

        resetAddPlayerForm();
      } else {
        resetAddPlayerForm();
      }

    };

    $scope.addHomeTeamBowlingDetails = function () {

      var playerExists = false;
      $scope.homeTeamBowlingDetails.forEach(function (playerInfo)    // check if the team is already added
      {
        if (playerInfo.player === $scope.visitingTeamBowler.name) {
          alertService.displayErrorMessage("Bowler already added..");
          playerExists = true;
        }
      });

      if (!playerExists) {
        $scope.homeTeamBowlingDetails.push({
          player: $scope.homeTeamBowler.name,
          overs: $scope.homeTeamBowlerOvers || 0,
          maiden: $scope.homeTeamBowlerMaiden || 0,
          runs: $scope.homeTeamBowlerRuns || 0,
          wickets: $scope.homeTeamBowlerWickets || 0,
          econ: calculateBowlingEconomy($scope.homeTeamBowlerRuns, $scope.homeTeamBowlerOvers)
        });

        addBowlingToTournament($scope.homeTeamBowlingDetails, 'home');

        resetAddPlayerForm();
      } else {
        resetAddPlayerForm();
      }

    };

    function resetAddPlayerForm() {
      $scope.visitingTeamPlayer = "";
      $scope.howOut = $scope.outs[11];
      $scope.visitingTeamFielder = "";
      $scope.visitingTeamBowler = "";
      $scope.runs = "";
      $scope.balls = "";
      $scope.fours = "";
      $scope.sixes = "";
      $scope.homeTeamPlayer = "";
      $scope.howOutTeam2 = $scope.outs[11];
      $scope.homeTeamFielder = "";
      $scope.homeTeamBowler = "";
      $scope.runsTeam2 = "";
      $scope.ballsTeam2 = "";
      $scope.foursTeam2 = "";
      $scope.sixesTeam2 = "";
    }

    $scope.homeTeamBattingScores = [];
    $scope.visitingTeamBattingScore = [];

    function addBattingToTournament(battingInfo, team) {
      if (team == 'home') {
        $scope.homeTeamBattingScores.push({
          team: $scope.matchDetails.homeTeam,
          battingScores: battingInfo
        });

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.homeTeamBatting = $scope.homeTeamBattingScores;
            match.battingScores = battingInfo;
            $scope.match = match;
          }
        });
      } else {
        $scope.visitingTeamBattingScore.push({
          team: $scope.matchDetails.visitingTeam,
          battingScores: battingInfo
        });

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.visitingTeamBatting = $scope.visitingTeamBattingScore;
            match.battingScores = battingInfo;
            $scope.match = match;
          }
        });
      }
      submitMatchScores($scope.match);
    }

    function addBowlingToTournament(bowling, team) {
      if (team == 'visiting') {
        $scope.visitingTeamBowlingScores.push({
          bowlingCard: bowling
        });

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.visitingTeamBowling = $scope.visitingTeamBowlingScores;
            match.bowlingCard = bowling;
            $scope.match = match;
          }
        });
      } else {
        $scope.homeTeamBowlingScores.push({
          bowlingCard: bowling
        });

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.homeTeamBowling = $scope.homeTeamBowlingScores;
            match.bowlingCard = bowling;
            $scope.match = match;
          }
        });
      }
      submitMatchScores($scope.match);
    }

    function getLosingTeam(result, team) {

      if(result === 'Tie' || result === 'Abandoned' || result === 'Washed Out'){
        return null;
      }

      if (team === $scope.matchDetails.homeTeam) {
        return $scope.matchDetails.visitingTeam;
      } else {
        return $scope.matchDetails.homeTeam;
      }
    }

    function getWinningTeam(result) {
      if(result === 'Tie' || result === 'Abandoned' || result === 'Washed Out'){
        return null;
      } else {
        return $scope.winningTeam.name;
      }

    }

    $scope.matches = [];
    $scope.visitingTeamScoreDetails = [];

    $scope.update = function () { // update the game info

      if($scope.result.name != 'Completed') {
        $scope.winningTeam = [{name: $scope.matchDetails.homeTeam}];
      }
      console.log(getWinningTeam($scope.result.name));
      console.log(getLosingTeam($scope.result.name, $scope.winningTeam.name));
      $scope.tournamentMatches.forEach(function (match) {
        if (match.matchNumber === $scope.matchNumber) {
          match.toss = $scope.toss.name;
          match.result = $scope.result.name;
          match.winningTeam = getWinningTeam($scope.result.name);
          match.losingTeam = getLosingTeam($scope.result.name, $scope.winningTeam.name);
          match.tossDecision = $scope.decision.name;
          match.mom = $scope.mom.name;
          match.status = 'Submitted';
          match.homeTeamTotal = $scope.homeTeamScoreDetails;
          match.visitingTeamTotal = $scope.visitingTeamScoreDetails;
          match.scoreCard = getScoreCardUpdated($scope.matchDetails.winningTeam, $scope.matchDetails.result, $scope.winningTeam.name, $scope.result.name);
          $scope.match = match;
        }
      });
      console.log(getScoreCardUpdated($scope.matchDetails.winningTeam, $scope.matchDetails.result, $scope.winningTeam.name, $scope.result.name));
      submitMatchScores($scope.match);

    };

    function getScoreCardUpdated(previousTeam, previousResult, newTeam, result) {
      console.log(previousResult + "here" +  previousTeam)
      if (previousTeam && previousResult) {
        if(previousResult === result || result === 'Tie' || result === 'Abandoned' || result === 'Washed Out') {
          console.log("result");
          return 'notChanged';
        } else if (previousTeam === newTeam) {
            console.log("teams");
            return 'notChanged';
          } else {
          return 'changed';
        }
      }
      return 'new';
    }

    function submitMatchScores(match) {

      $scope.matches.push(
        {
          all: $scope.tournamentMatches,
          single: match
        }
      );

      matchDetailsService.updateMatch($scope.tournamentName, $scope.matches).success(function (response) {
        alertService.displaySaveMessage("Success");
        getMatchDetails('update');
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });

    }

    $scope.homeTeamScoreDetails = [];
    $scope.visitingTeamScoreDetails = [];
    $scope.addHomeTeamTotal = function () {

      $scope.homeTeamScoreDetails.push({
        total: $scope.homeTeamRuns,
        overs: $scope.homeTeamOvers,
        wickets: $scope.homeTeamWickets,
        wides: $scope.homeTeamWides,
        noBalls: $scope.homeTeamNoBalls,
        byes: $scope.homeTeamByes,
        legByes: $scope.homeTeamLegByes
      });
      addTeamTotalScore($scope.homeTeamScoreDetails, 'home');

    };

    $scope.addVisitingTeamTotal = function () {
      $scope.visitingTeamScoreDetails.push({
        total: $scope.visitingTeamRuns,
        overs: $scope.visitingTeamOvers,
        wickets: $scope.visitingTeamWickets,
        wides: $scope.visitingTeamWides,
        noBalls: $scope.visitingTeamNoBalls,
        byes: $scope.visitingTeamByes,
        legByes: $scope.visitingTeamLegByes
      });
      addTeamTotalScore($scope.homeTeamScoreDetails, 'visiting');
    };

    function addTeamTotalScore(teamScores, team) {
      if (team === 'home') {
        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.homeTeamTotal = $scope.homeTeamScoreDetails;
            $scope.match = match;
          }
        });
      } else {
        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.visitingTeamTotal = $scope.visitingTeamScoreDetails;
            $scope.match = match;
          }
        });
      }
      submitMatchScores($scope.match);
    }

    $scope.submitMatch = function() {
      $scope.tournamentMatches.forEach(function (match) {
        if (match.matchNumber === $scope.matchNumber) {
          match.status = 'Review';
          $scope.match = match;
        }
      });

      submitMatchForReview($scope.match);
    };

    function submitMatchForReview(match) {
      $scope.matches.push(
        {
          all: $scope.tournamentMatches,
          single: match
        }
      );

      matchDetailsService.submitMatch($scope.tournamentName, $scope.matches).success(function (response) {
        $scope.modalInstance.dismiss('cancel');
        alertService.displaySaveMessage("Success");
        getMatchDetails('update');
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    $scope.open = function () {
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'matchSubmit.html',
        scope:$scope
      });
    };

    $scope.close = function () {
      $scope.modalInstance.dismiss('cancel');
    };

    $scope.return = function () {
      $location.path("/tournament/" + $scope.tournamentName);
    }

  });
