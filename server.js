var express = require('express')
  , toobusy = require('toobusy')
  , app = express()
  , requireIndex = require('requireindex')
  , path = require('path')
  , bots = requireIndex(path.join(__dirname, 'lib', 'bots'))
  , env = require('./lib/env')
  , http = require('http')

app.configure(function() {
  app.use(function(req, res, next) {
    if (toobusy()) {
      res.send(503, "Too busy");
    } else {
      next();
    }
  });
  app.use(express.json());
  app.use(app.router);
});

function apiKeyMiddleware(req, res, next) {
  if (req.body.apiKey === env.API_KEY) {
    next();
  } else {
    res.send(400, "Bad API key");
  }
}

app.get('/', function(req, res) {
  res.send(200, "OK");
});

app.post('/create', apiKeyMiddleware, function(req, res) {
  var bot = bots[req.body.type];
  if (! bot) {
    res.send(400, "Invalid bot type");
    return;
  }
  res.send(200, "OK");
});

var server = http.createServer(app);
server.listen(env.PORT, env.HOST, function() {
  console.info("Listening at http://" + env.HOST + ":" + env.PORT);
  if (process.send) process.send('online');
});

process.on('message', function(message) {
  if (message === 'shutdown') process.exit(0);
});
