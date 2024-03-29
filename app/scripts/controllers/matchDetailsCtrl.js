'use strict';

angular.module('howWasThat')
  .controller('matchDetailsCtrl', function ($scope, teamService, $location, $routeParams, $rootScope, matchDetailsService, $cookieStore, tournamentService, alertService, $modal) {

    $scope.matchDetails = true;

    $scope.umpires = [{name: 'Self'},
      {name: 'Neutral'}];
    $scope.decisions = [{name: 'Batting'},
      {name: 'Bowling'}];
    $scope.tossInfo = [];

    $scope.tab = "home";
    $scope.setTab = function (newTab) {
      $scope.tab = newTab;
    };

    $scope.isActiveTab = function (tab) {
      return $scope.tab === tab;
    };

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
          $scope.homeTeamBattingDetails = $scope.matchDetails.homeTeamBatting;
        }

        if ($scope.matchDetails.visitingTeamBatting) {
          $scope.visitingTeamBattingDetails = $scope.matchDetails.visitingTeamBatting;
        }

        if ($scope.matchDetails.visitingTeamBowling) {
          $scope.visitingTeamBowlingDetails = $scope.matchDetails.visitingTeamBowling;
        }
        if ($scope.matchDetails.homeTeamBowling) {
          $scope.homeTeamBowlingDetails = $scope.matchDetails.homeTeamBowling;
        }
        if ($scope.matchDetails.status) {
          $scope.editMatchStatus = true;
          $scope.tossInfo.push({name: $scope.matchDetails.toss, id: 1});
          $scope.toss = $scope.tossInfo[0];
        }

        if ($scope.matchDetails.homeTeamTotal && $scope.matchDetails.homeTeamTotal.length > 0) {
          $scope.homeTeamRuns = $scope.matchDetails.homeTeamTotal[0].total;
          $scope.homeTeamOvers = $scope.matchDetails.homeTeamTotal[0].overs;
          $scope.homeTeamWickets = $scope.matchDetails.homeTeamTotal[0].wickets;
          $scope.homeTeamWides = $scope.matchDetails.homeTeamTotal[0].wides;
          $scope.homeTeamNoBalls = $scope.matchDetails.homeTeamTotal[0].noBalls;
          $scope.homeTeamByes = $scope.matchDetails.homeTeamTotal[0].byes;
          $scope.homeTeamLegByes = $scope.matchDetails.homeTeamTotal[0].legByes;
          $scope.homeTeamRunRate = $scope.homeTeamRuns / $scope.homeTeamOvers;
        }

        if ($scope.matchDetails.visitingTeamTotal && $scope.matchDetails.visitingTeamTotal.length > 0) {
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
          name: fullName,
          email: player.email
        })
      });
      createManOfMatch($scope.playerList);
    }

    function visitingTeamPlayers(players) {
      players.forEach(function (player)
      {
        var fullName = player.firstName + ' ' + player.lastName;
        $scope.visitingTeamPlayerList.push({
          name: fullName,
          email: player.email
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
    $scope.newBatterHomeTeam = [];
    $scope.visitingTeamBattingDetails = [];
    $scope.visitingTeamFielder = [];
    $scope.visitingTeamBowler = [];
    $scope.homeTeamBowler = [];
    $scope.homeTeamFielder = [];

    $scope.visitingTeamBowlingDetails = [];
    $scope.visitingTeamNewBowler = [];
    $scope.newBatterVisitingTeam = [];
    $scope.homeTeamBowlingDetails = [];
    $scope.homeTeamNewBowler = [];
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
        $scope.newBatterHomeTeam = [];
        $scope.newBatterHomeTeam.push({
          player: $scope.visitingTeamPlayer.name,
          outNotOut: createHowOut($scope.howOut.name, $scope.visitingTeamFielder.name, $scope.visitingTeamBowler.name),
          howOut: $scope.howOut.name,
          fielder: $scope.visitingTeamFielder.name || '--',
          bowler: $scope.visitingTeamBowler.name || '--',
          email: $scope.visitingTeamPlayer.email,
          runs: $scope.runs || 0,
          balls: $scope.balls || 0,
          fours: $scope.fours || 0,
          sixes: $scope.sixes || 0,
          strikeRate: calculateStrikeRate($scope.runs, $scope.balls)
        });
        $scope.homeTeamBattingDetails.push($scope.newBatterHomeTeam[0]);

        addBattingToTournament($scope.homeTeamBattingDetails, 'home', $scope.newBatterHomeTeam);
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
        $scope.newBatterVisitingTeam = [];
        $scope.newBatterVisitingTeam.push({
          player: $scope.homeTeamPlayer.name,
          email: $scope.homeTeamPlayer.email,
          outNotOut: createHowOut($scope.howOutTeam2.name, $scope.homeTeamFielder.name, $scope.homeTeamBowler.name),
          howOut: $scope.howOutTeam2.name,
          fielder: $scope.homeTeamFielder.name || '--',
          bowler: $scope.homeTeamBowler.name || '--',
          runs: $scope.runsTeam2 || 0,
          balls: $scope.ballsTeam2 || 0,
          fours: $scope.foursTeam2 || 0,
          sixes: $scope.sixesTeam2 || 0,
          strikeRate: calculateStrikeRate($scope.runsTeam2, $scope.ballsTeam2)
        });
        $scope.visitingTeamBattingDetails.push($scope.newBatterVisitingTeam[0]);

        addBattingToTournament($scope.visitingTeamBattingDetails, 'visiting', $scope.newBatterVisitingTeam);
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
        $scope.visitingTeamNewBowler.push({
          player: $scope.visitingTeamBowler.name,
          email: $scope.visitingTeamBowler.email,
          overs: $scope.visitingTeamBowlerOvers || 0,
          maiden: $scope.visitingTeamBowlerMaiden || 0,
          runs: $scope.visitingTeamBowlerRuns || 0,
          wickets: $scope.visitingTeamBowlerWickets || 0,
          econ: calculateBowlingEconomy($scope.visitingTeamBowlerRuns, $scope.visitingTeamBowlerOvers)
        });

        $scope.visitingTeamBowlingDetails.push($scope.visitingTeamNewBowler[0]);

        addBowlingToTournament($scope.visitingTeamBowlingDetails, 'visitingBowling', $scope.visitingTeamNewBowler);

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

        $scope.homeTeamNewBowler.push({
          player: $scope.homeTeamBowler.name,
          email: $scope.homeTeamBowler.email,
          overs: $scope.homeTeamBowlerOvers || 0,
          maiden: $scope.homeTeamBowlerMaiden || 0,
          runs: $scope.homeTeamBowlerRuns || 0,
          wickets: $scope.homeTeamBowlerWickets || 0,
          econ: calculateBowlingEconomy($scope.homeTeamBowlerRuns, $scope.homeTeamBowlerOvers)
        });

        $scope.homeTeamBowlingDetails.push($scope.homeTeamNewBowler[0]);

        addBowlingToTournament($scope.homeTeamBowlingDetails, 'homeBowling', $scope.homeTeamNewBowler);

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
      $scope.homeTeamBattingDetails = [];
      $scope.newBatterHomeTeam = [];
      $scope.visitingTeamBattingDetails = [];
      $scope.visitingTeamFielder = [];
      $scope.visitingTeamBowler = [];
      $scope.homeTeamBowler = [];
      $scope.homeTeamFielder = [];
      $scope.visitingTeamBowlingDetails = [];
      $scope.visitingTeamNewBowler = [];
      $scope.newBatterVisitingTeam = [];
      $scope.homeTeamBowlingDetails = [];
      $scope.homeTeamNewBowler = [];
      $scope.visitingTeamBowlingScores = [];
      $scope.homeTeamBowlingScores = [];
      $scope.matches = [];
      $scope.visitingTeamBowlerOvers = "";
      $scope.visitingTeamBowlerMaiden = "";
      $scope.visitingTeamBowlerRuns = "";
      $scope.visitingTeamBowlerWickets = "";
      $scope.homeTeamBowlerOvers = "";
      $scope.homeTeamBowlerMaiden = "";
      $scope.homeTeamBowlerRuns = "";
      $scope.homeTeamBowlerWickets = "";
    }

    $scope.homeTeamBattingScores = [];
    $scope.visitingTeamBattingScore = [];

    function addBattingToTournament(battingInfo, team, newBatter) {
      if (team == 'home') {

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            //match.homeTeamBatting.push(newBatter);
            match.battingScores = battingInfo;
            $scope.match = match;
          }
        });
      } else {

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            //match.visitingTeamBatting.push(newBatter);;
            match.battingScores = battingInfo;
            $scope.match = match;
          }
        });
      }
      submitMatchScores($scope.match, team, newBatter);
    }

    function addBowlingToTournament(bowling, team, newBowler) {
      if (team == 'visiting') {
        $scope.visitingTeamBowlingScores.push({
          bowlingCard: bowling
        });

        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
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
            match.bowlingCard = bowling;
            $scope.match = match;
          }
        });
      }
      submitMatchScores($scope.match, team, newBowler);
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

      $scope.tournamentMatches.forEach(function (match) {
        if (match.matchNumber === $scope.matchNumber) {
          match.toss = $scope.toss.name;
          match.result = $scope.result.name;
          match.winningTeam = getWinningTeam($scope.result.name);
          match.losingTeam = getLosingTeam($scope.result.name, $scope.winningTeam.name);
          match.tossDecision = $scope.decision.name;
          match.mom = $scope.mom.name;
          match.updatedBy = $rootScope.currentUser.email;
          match.lastUpdated = new Date();
          match.status = 'Submitted';
          match.previousResult = $scope.matchDetails.result;
          match.previousWinningTeam = $scope.matchDetails.winningTeam;
          match.scoreCard = getScoreCardUpdated($scope.matchDetails.winningTeam, $scope.matchDetails.result, $scope.winningTeam.name, $scope.result.name);
          $scope.match = match;
        }
      });
      submitMatchResult($scope.match);
    };

    function submitMatchScores(match, team, newBatterBowler) {

      $scope.matches.push(
        {
          all: $scope.tournamentMatches,
          single: match,
          battingBowling: team,
          batterBowler: newBatterBowler
        }
      );

      matchDetailsService.updateMatchScores($scope.tournamentName, $scope.matches).success(function (response) {
        alertService.displaySaveMessage("Success");
        getMatchDetails('update');
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });

    }

    function getScoreCardUpdated(previousTeam, previousResult, newTeam, result) {
      if(!previousResult) {
        return 'new';
      } else if(previousResult === result && (result === 'Tie' || result === 'Washed Out' || result === 'Abandoned')){
        return 'unchanged';
      } else if ((previousResult === 'Tie' || previousResult === 'Washed Out' || previousResult === 'Abandoned') && (result === 'Tie' || result === 'Washed Out' || result === 'Abandoned')) {
        return 'unchanged';
      } else if((previousResult === 'Tie' || previousResult === 'Washed Out' || previousResult === 'Abandoned') && (result === 'Completed')) {
        return 'changed';
      } else if (previousResult === 'Completed' && result === 'Completed' && (previousTeam === newTeam)) {
        return 'unchanged';
      } else if((result === 'Tie' || result === 'Washed Out' || result === 'Abandoned') && (previousResult === 'Completed')) {
        return 'changed';
      }else if (previousResult === 'Completed' && result === 'Completed' && (previousTeam !== newTeam)) {
        return 'changed';
      }
    }

    function submitMatchResult(match) {

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
        total: $scope.homeTeamRuns || 0,
        overs: $scope.homeTeamOvers || 0,
        wickets: $scope.homeTeamWickets || 0,
        wides: $scope.homeTeamWides || 0,
        noBalls: $scope.homeTeamNoBalls || 0,
        byes: $scope.homeTeamByes || 0,
        legByes: $scope.homeTeamLegByes || 0
      });


      addTeamTotalScore($scope.homeTeamScoreDetails, 'home');

    };

    $scope.addVisitingTeamTotal = function () {
      $scope.visitingTeamScoreDetails.push({
        total: $scope.visitingTeamRuns || 0,
        overs: $scope.visitingTeamOvers || 0,
        wickets: $scope.visitingTeamWickets || 0,
        wides: $scope.visitingTeamWides || 0,
        noBalls: $scope.visitingTeamNoBalls || 0,
        byes: $scope.visitingTeamByes || 0,
        legByes: $scope.visitingTeamLegByes || 0
      });
      addTeamTotalScore($scope.homeTeamScoreDetails, 'visiting');
    };

    function addTeamTotalScore(teamScores, team) {
      if (team === 'home') {
        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.homeTeamTotal = $scope.homeTeamScoreDetails;
            match.scoreCard = 'unchanged';
            match.updatedBy = $rootScope.currentUser.email;
            match.lastUpdated = new Date();
            match.whichTeamTotal = team;
            $scope.match = match;
          }
        });
      } else {
        $scope.tournamentMatches.forEach(function (match) {
          if (match.matchNumber === $scope.matchNumber) {
            match.visitingTeamTotal = $scope.visitingTeamScoreDetails;
            match.scoreCard = 'unchanged';
            match.updatedBy = $rootScope.currentUser.email;
            match.lastUpdated = new Date();
            match.whichTeamTotal = team;
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

    $scope.submitMatchForApproval = function () {
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'matchSubmit.html',
        scope:$scope
      });
    };

    $scope.editPlayerScore = function () {
      var bowler;
      if(!$scope.playerScoreToEdit.bowler.name) {
         bowler = $scope.playerScoreToEdit.bowler;
      } else {
        bowler = $scope.playerScoreToEdit.bowler.name;
      }

      $scope.playerScoreToEdit.outNotOut = createHowOut($scope.playerScoreToEdit.howOut.name, $scope.playerScoreToEdit.fielder.name, bowler),
      $scope.playerScoreToEdit.howOut = $scope.playerScoreToEdit.howOut.name;
      $scope.playerScoreToEdit.strikeRate = calculateStrikeRate($scope.playerScoreToEdit.runs, $scope.playerScoreToEdit.balls)
      updatePlayerScores($scope.playerScoreToEdit);
    };


    function updatePlayerScores(newScore) {
      var updateBattingScoreOfPlayer = [];

      updateBattingScoreOfPlayer.push({
        tournament: $scope.tournamentName,
        matchNumber: $scope.matchNumber,
        battingTeam: $scope.battingSide,
        new: newScore,
        old: $scope.playerPreviousScoreToEdit
      });

      matchDetailsService.updatePlayerBatting($scope.teamOfPlayerToEditBattingScore, updateBattingScoreOfPlayer).success(function (response) {
        $scope.modalInstance.dismiss('cancel');
        alertService.displaySaveMessage("Success");
        getMatchDetails('update');
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    }

    $scope.editPlayerBowling = function () {
      var updateBowlingScoreOfPlayer = [];

      updateBowlingScoreOfPlayer.push({
        tournament: $scope.tournamentName,
        matchNumber: $scope.matchNumber,
        bowlingTeam: $scope.bowlingSide,
        new: $scope.playerBowlingToEdit,
        old: $scope.playerPreviousBowlingToEdit
      });

      matchDetailsService.updatePlayerBowling($scope.teamOfPlayerToEditBowlingScore, updateBowlingScoreOfPlayer).success(function (response) {
        $scope.modalInstance.dismiss('cancel');
        alertService.displaySaveMessage("Success");
        getMatchDetails('update');
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });
    };

    $scope.deletePlayerFromScoreSheet = function (team, player) {
      $scope.playerToRemove = player;
      $scope.teamOfPlayerToRemove = team;
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'deletePlayerFromScoreSheet.html',
        scope:$scope
      });
    };

    $scope.editPlayerBattingScoreSheet = function (team, player, battingSide) {
      $scope.battingSide = battingSide;
      $scope.editScreen = true;
      $scope.playerScoreToEdit = player;
      $scope.playerPreviousScoreToEdit = player;
      var outValue = $scope.outs.map(function(x) {return x.name; }).indexOf($scope.playerScoreToEdit.howOut);
      $scope.playerScoreToEdit.howOut = $scope.outs[outValue];
      $scope.teamOfPlayerToEditBattingScore = team;
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'editPlayerBattingFromScoreSheet.html',
        scope:$scope
      });
    };

    $scope.editPlayerBowlingScoreSheet = function (team, player, bowlingSide) {
      $scope.bowlingSide = bowlingSide;
      $scope.editScreen = true;
      $scope.playerBowlingToEdit = player;
      $scope.playerPreviousBowlingToEdit = player;
      $scope.teamOfPlayerToEditBowlingScore = team;
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'editPlayerBowlingFromScoreSheet.html',
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
