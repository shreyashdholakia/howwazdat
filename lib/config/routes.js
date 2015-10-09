'use strict';

var path = require('path'),
    auth = require('../config/auth');

module.exports = function(app) {
  // User Routes
  var users = require('../controllers/users');
  app.post('/auth/users', users.create);

  app.get('/auth/users/:userId', users.show);
  app.get('/api/users', users.all);

  // Check if username is available
  // todo: probably should be a query on users
  app.get('/auth/check_username/:username', users.exists);

  // Session Routes
  var session = require('../controllers/session');
  app.get('/auth/session', auth.ensureAuthenticated, session.session);
  app.post('/auth/session', session.login);
  app.del('/auth/session', session.logout);

  // Blog Routes
  var blogs = require('../controllers/blogs');
   var profile = require('../controllers/userProfileController');
  app.get('/api/blogs', blogs.all);
  app.post('/api/blogs', auth.ensureAuthenticated, blogs.create);
  app.post('/api/profile', auth.ensureAuthenticated, profile.create);
  app.put('/api/profile/:username', auth.ensureAuthenticated, profile.update);
  app.get('/api/profile/:username', auth.ensureAuthenticated, profile.userDetails);
  //app.put('/api/profile/:profileId', auth.ensureAuthenticated, profile.update);
  app.get('/api/blogs/:blogId', blogs.show);
  app.put('/api/blogs/:blogId', auth.ensureAuthenticated, auth.blog.hasAuthorization, blogs.update);
  app.del('/api/blogs/:blogId', auth.ensureAuthenticated, auth.blog.hasAuthorization, blogs.destroy);

  // Teams page
  var team = require('../controllers/teamController');
  app.post('/api/team', team.create);
  app.get('/api/team/:teamName', team.show);
  app.put('/api/team/:teamName', team.update);
  app.get('/api/team', team.all);

  var teamList = require('../controllers/teamController');
    app.post('/api/teamList', teamList.createList);

  var tournament = require('../controllers/tournamentController');
  app.get('/api/tournaments', tournament.all);
  app.post('/api/tournament', tournament.create);
  app.get('/api/tournament/:tournamentName', tournament.show);
  app.put('/api/tournament/:tournamentName', tournament.addTeams);
  app.put('/api/tournament/match/:tournamentName', tournament.addMatches);

  app.get('/api/match/:tournament/:matchNumber', tournament.match);

  var match = require('../controllers/matchController');
  app.post('/api/match/:tournament', match.update);
  app.put('/api/match/:tournament', match.updateMatchScores);
  app.post('/api/match', match.playerMatches);
  app.post('/api/match/review/:tournament', match.submitMatch);

  var point = require('../controllers/pointController');
  app.get('/api/point/:tournament', point.show);


  //Setting up the blogId param
  app.param('blogId', blogs.blog);

  // Angular Routes
  app.get('/partials/*', function(req, res) {
    var requestedView = path.join('./', req.url);
    res.render(requestedView);
  });

  app.get('/*', function(req, res) {
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.user_info));
    }

    res.render('index.html');
  });

}
