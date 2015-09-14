'use strict';

angular.module('angularPassportApp')
  .controller('tournamentCtrl', function ($scope, tournamentService, teamService, ProfileService, $location, $routeParams, $rootScope, $http, $cookieStore, alertService, $modal, uiCalendarConfig, $filter, $compile, $timeout) {

    $scope.isProfileCreated = false;
    $scope.eventSources = [];
    $scope.umpires = [{name: 'Self'},
      {name: 'Neutral'}];
    $scope.umpireType = $scope.umpires[0];

    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.numberOfPages=function(){
     return Math.ceil($scope.tournamentMatches.length/$scope.pageSize);
    }

    $scope.sortType = 'matchDate';
    $scope.sortReverse = true;

    $scope.today = function () {
      $scope.matchDate = new Date();
    };
    $scope.today();

    $scope.matchDate = new Date();

    $scope.matchStartTime = new Date();
    $scope.matchEndTime = new Date();
    $scope.ismeridian = true;
    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.matchTypes = [
      {type: 'T20'},
      {type: 'ODI'},
      {type: 'Test'}
    ];

    $scope.roundTypes = [
      {type: 'League'},
      {type: 'PlayOffs'},
      {type: 'Quarter Finals'},
      {type: 'Semi Finals'},
      {type: 'Final'},
      {type: 'Eliminator'},
      {type: 'Qualifier'}
    ];

    $scope.roundType = $scope.roundTypes[0];

    $scope.matchType = $scope.matchTypes[0];

    var date = new Date();

    $scope.events = [];

    $scope.renderCalendar = function () {
      $timeout(function () {
        $('#calendar').fullCalendar('render');
        $('#calendar').fullCalendar('rerenderEvents');
      }, 0);
    };

    $scope.renderCalendar();

    $scope.eventSources = [$scope.events];


    $scope.addEvent = function (tournamentMatches) {
      tournamentMatches.forEach(function (matchInfo)    // check if the team is already added
      {
        var match = matchInfo.homeTeam + ' ' + 'Vs' + ' ' + matchInfo.visitingTeam;
        var date = $filter('date')(matchInfo.matchDate, 'medium');
        $scope.events.push({
          title: match,
          start: date,
          stick: true
        })
      });
    };

    /* Render Tooltip */
    $scope.eventRender = function (event, element, view) {
      var msg = event.title;
      element.attr({
        'tooltip': msg,
        'tooltip-append-to-body': true
      });
      $compile(element)($scope);
    };
    /* config object */
    $scope.uiConfig = {
      calendar: {
        height: 450,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventRender: $scope.eventRender
      }
    };

    $scope.checkProfileCreated = function () {
      ProfileService.findProfile($rootScope.currentUser.username).success(function (response) {
        $scope.profileExists = response.exists;
        $scope.user = response.data;
      }).error(function (status, data) {
         alertService.displayErrorMessage("There was an error! Please try again.");
      });

    };

    $scope.tournamentPage = ($routeParams.tournamentName) ? true : false;

    $scope.checkProfileCreated();
    $scope.tournamentDetails = [];

    $scope.updateProfile = function (user) {

      if ($scope.profileExists) {
        user.username = $rootScope.currentUser.username;
        user.updatedDate = new Date();
        ProfileService.update(user).success(function (data) {
          $location.path("/profile");
        }).error(function (status, data) {
           alertService.displayErrorMessage("There was an error! Please try again.");
        });
      } else {
        $scope.create(user);
      }
    };

    $scope.getTournamentDetails = function () {
      var tournamentName = $routeParams.tournamentName;
      if (tournamentName) {
        tournamentService.tournamentDetails(tournamentName).success(function (response) {
          if (response.exists) {
            $scope.tournamentExists = response.exists;
            if (response.data.teams) {
              $scope.tournamentTeams = response.data.teams;
            }
            if (response.data.matches) {
              $scope.tournamentMatches = response.data.matches;
              $scope.addEvent($scope.tournamentMatches);
            }

            $scope.tournamentInfo = response.data;
            //$('#calendar').fullCalendar('refetchEvents');
            loadGoogleMap($scope.tournamentInfo);
          } else {
            $location.path("/createTournament");
          }
        }).error(function (status, data) {
          alertService.displayErrorMessage("There was an error! Please try again.");
        });
      } else {
        $location.path("/tournaments");

      }
    };

    function getTournamentList() {

      tournamentService.all().success(function (response) {
        $scope.tournamentList = response.data;
        console.log($scope.tournamentList);
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.n");
      });

    }

    function getTeamList() {
      teamService.getTeams().success(function (response) {
        $scope.teamList = response.data;
      }).error(function (status, data) {
        alertService.displayErrorMessage("There was an error! Please try again.");
      });

    }
    getTournamentList();
    getTeamList();
    $scope.tournamentTeams = [];

    $scope.addTeamToTournament = function (team) {
      alertService.clearLastToast();
      var teamExists = false;
      if (team.players) {
        team.players.forEach(function (playerInfo) // Check the captain of the team and set it
        {
          if (playerInfo.captain === 'C') {
            $scope.captain = playerInfo.firstName + ' ' + playerInfo.lastName;
          }
        });
      }

      $scope.tournamentTeams.forEach(function (playerInfo)    // check if the team is already added
      {
        if (playerInfo.teamName === team.teamName) {
          alertService.displayErrorMessage("Team already playing");
          teamExists = true;

        }
      });

      if (!teamExists) {   // if team already added skip else add the team
        $scope.tournamentTeams.push({
          teamName: team.teamName,
          captain: $scope.captain || '--'
        });
        $scope.saveTeams($scope.tournamentTeams);
      }

      // alertService.displaySaveMessage("Teams Added");
    };

    $scope.saveTeams = function (teams) {
      tournamentService.addTeams(teams, $scope.tournamentInfo.tournamentName).success(function (response) {
        $location.path("/tournament/" + response.data.tournamentName);
        $scope.tournamentName = response.data.tournamentName;
        $scope.tournamentTeams = response.data.teams;
        $scope.tournamentPage = true;
        $scope.teamToDelete = [];
        alertService.displaySaveMessage("Success");
      }).error(function (status, data) {
        alertService.displayErrorMessage("Error: Please try again!");
      });

    };


    $scope.getTournamentDetails();

    $scope.createTournament = function (tournament) {
      var joiningDate = new Date();
      $scope.tournamentDetails.push({
        tournamentName: $scope.tournament.name,
        organizer: $scope.tournament.organizer,
        owner: $scope.user.email,
        createdDate: joiningDate,
        address: $scope.tournament.address,
        addressLatitude: $scope.chosenPlaceDetails.geometry.location.G,
        addressLongitude: $scope.chosenPlaceDetails.geometry.location.K
      });

      tournamentService.create($scope.tournamentDetails).success(function (data) {
        $location.path("/tournament/" + data.data.tournamentName);
        $scope.tournamentName = data.data.tournamentName;
        $scope.tournamentPage = true;
        $scope.tournamentInfo = data.data;
        loadGoogleMap($scope.tournamentInfo);
      }).error(function (status, data) {
         alertService.displayErrorMessage("There was an error! Please try again.");
      });
    };

    $scope.tab = "calendar";
    $scope.isEmail = true;
    $('#calendar').fullCalendar('render');

    $scope.setTab = function (newTab) {
      $scope.tab = newTab;
      $('#calendar').fullCalendar('render');

    };

    $scope.isActiveTab = function (tab) {
      return $scope.tab === tab;
    };


    $scope.teamToDelete = [];

    $scope.open = function (team) {
      $scope.teamToDelete = team;
      alertService.clearLastToast();
      $scope.modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'delete.html',
        scope: $scope
      });
    };

    $scope.close = function () {
      $scope.modalInstance.dismiss('cancel');

    };

    $scope.deleteTeam = function () {
      $scope.modalInstance.dismiss('cancel');
      var index = $scope.tournamentTeams.indexOf($scope.teamToDelete);
      $scope.tournamentTeams.splice(index, 1);
      $scope.saveTeams($scope.tournamentTeams);
    };

    function initMap(info) {
      var myLatLng = {lat: Number(info.addressLatitude), lng: Number(info.addressLongitude)};

      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: myLatLng
      });

      var contentString = '<div id="gmap-content">' +
        '<div id="gmap-siteNotice">' +
        '</div>' +
        '<h2 id="gmap-firstHeading" class="gmap-firstHeading">' + info.tournamentName + '</h2>' +
        '<div id="gmap-bodyContent">' +
        '<p><b>Address</b>:<br>' +
        info.address
        + '<br> <br>' +
        '<strong><a href="http://maps.google.com/maps?saddr="' + info.address + '" title="Get Driving Directions" target="_blank">Get Directions</a></strong><br>' +
        '</p>' +
        '<div class="clear clearfix"></div>' +
        '</div>' +
        '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Hello World!'
      });

      marker.addListener('click', function () {
        infowindow.open(map, marker);
      });
    }

    function loadGoogleMap(tournamentInfo) {
      google.maps.event.addDomListener(document.getElementById("map"), 'load', initMap(tournamentInfo));
    }

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.dateOptions = {
      'year-format': "'yy'",
      'starting-day': 1
    };

    $scope.stageFilter = [];
    $scope.filterSelected = [];
    $scope.filterTeams = [];
    $scope.filteredTeams = [];

    $scope.filterStages = function (stage) {
      var i = $.inArray(stage, $scope.stageFilter);
      if (i > -1) {
        $scope.stageFilter.splice(i, 1);
        $scope.filterSelected.splice(i, 1);
      } else {
        $scope.stageFilter.push(stage)
        $scope.filterSelected.push({
          filter: stage
        })
      }
    };

    $scope.stages = function (tournamentMatches) {
      if ($scope.stageFilter.length > 0) {
        if ($.inArray(tournamentMatches.roundType, $scope.stageFilter) < 0)
          return;
      }
      return tournamentMatches;
    };

    $scope.clearFilter = function () {
      $scope.stageFilter = [];

    };


    $scope.teamsFilter = function (team) {
      var i = $.inArray(team, $scope.filteredTeams);
      if (i > -1) {
        $scope.filteredTeams.splice(i, 1);
        $scope.filterSelected.splice(i, 1);
      } else {
        $scope.stageFilter.push(team)
        $scope.filterTeams.push({
          filter: team
        })
      }
    };

    // Create Cricket Match
    $scope.tournamentMatches = [];
    $scope.match = [];
    $scope.matches = [];

    $scope.submitMatch = function () {
      $scope.matchDate.setHours($scope.matchStartTime.getHours());
      $scope.matchDate.setMinutes($scope.matchStartTime.getMinutes());
      var matchNumber = $scope.tournamentInfo.tournamentName + (new Date().getTime()).toString(36);

      if ($scope.homeTeam.teamName && $scope.visitingTeam.teamName) {
        if ($scope.homeTeam.teamName === $scope.visitingTeam.teamName) {
          alertService.displayErrorMessage("Same Team cannot play against each other. Please select two different teams");
        } else {
          $scope.tournamentMatches.push({
            homeTeam: $scope.homeTeam.teamName,
            visitingTeam: $scope.visitingTeam.teamName,
            matchDate: $scope.matchDate,
            startTime: $scope.matchStartTime,
            endTime: $scope.matchEndTime,
            umpire: $scope.umpireType.name,
            matchType: $scope.matchType.type,
            roundType: $scope.roundType.type,
            matchNumber: matchNumber
          });

          $scope.match.push({
                      homeTeam: $scope.homeTeam.teamName,
                      visitingTeam: $scope.visitingTeam.teamName,
                      matchDate: $scope.matchDate,
                      startTime: $scope.matchStartTime,
                      endTime: $scope.matchEndTime,
                      umpire: $scope.umpireType.name,
                      matchType: $scope.matchType.type,
                      roundType: $scope.roundType.type,
                      matchNumber: matchNumber
                    });

           $scope.matches.push(
              {all:$scope.tournamentMatches,
               single: $scope.match}
           );

          tournamentService.createMatch($scope.tournamentInfo.tournamentName, $scope.matches).success(function (data) {
            $location.path("/tournament/" + data.data.tournamentName);
            $scope.tournamentName = data.data.tournamentName;
            $scope.tournamentPage = true;
            $scope.tournamentInfo = data.data;
            $scope.tournamentMatches = data.data.matches;
            $scope.addEvent($scope.tournamentMatches);
            loadGoogleMap($scope.tournamentInfo);
            $scope.createMatch = false;
            $('#calendar').fullCalendar('refetchEvents');
            $scope.tab = "calendar";
          }).error(function (status, data) {
             alertService.displayErrorMessage("There was an error! Please try again.");
          });
        }
      } else {
        alertService.displayErrorMessage("Selected Team are not part of the tournament. Please correct the error and try again!");
      }
    };
  });


  angular.module('angularPassportApp')
  .filter('startFrom', function() {
      return function(input, start) {
          start = +start; //parse to int
          return input.slice(start);
      }
  });



