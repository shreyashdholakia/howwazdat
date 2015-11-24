'use strict';

var app = angular.module('howWasThat', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'http-auth-interceptor',
  'ui.bootstrap',
  'ui.calendar',
  'angularFileUpload'
]);

var options = {};
options.api = {};
options.api.base_url = "http://how-waz-that.herokuapp.com";

  app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/tournaments', {
        templateUrl: 'partials/tournament/tournaments.html',
        controller: 'MainCtrl'
      })
      .when('/teams', {
        templateUrl: 'partials/team/teams.html',
        controller: 'MainCtrl'
      })
      .when('/blogs', {
        templateUrl: 'partials/blogs/list.html',
        controller: 'BlogsCtrl'
      })
      .when('/test', {
        templateUrl: 'partials/blogs/list.html',
        controller: 'TeamCtrl'
      })
      .when('/createTeam', {
        templateUrl: 'partials/team/createTeam.html',
        controller: 'TeamCtrl'
      })
      .when('/team/:teamName' , {
        templateUrl: 'partials/team/team.html',
        controller: 'TeamCtrl'
      })
      .when('/createTournament', {
        templateUrl: 'partials/tournament/createTournament.html',
        controller: 'tournamentCtrl'
      })
      .when('/tournament/:tournament', {
        templateUrl: 'partials/tournament/createTournament.html',
        controller: 'tournamentCtrl'
      })
      .when('/tournament/:tournamentName/:matchNumber', {
        templateUrl: 'partials/match/matchDetail.html',
        controller: 'matchDetailsCtrl'
      })
      .when('/profile', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/profile/:player', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/blogs/create', {
        templateUrl: 'partials/blogs/create.html',
        controller: 'BlogsCtrl'
      })
      .when('/blogs/:blogId/edit', {
        templateUrl: 'partials/blogs/edit.html',
        controller: 'BlogsCtrl'
      })
      .when('/blogs/:blogId', {
        templateUrl: 'partials/blogs/view.html',
        controller: 'BlogsCtrl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
  })

  .run(function ($rootScope, $location, Auth) {

    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function(currentUser) {
      // if no currentUser and on a page that requires authorization then try to update it
      // will trigger 401s if user does not have a valid session
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
        Auth.currentUser();
      }
    });

    // On catching 401 errors, redirect to the login page.
    $rootScope.$on('event:auth-loginRequired', function() {
      $location.path('/login');
      return false;
    });
  });
