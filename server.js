var express = require('express')
  , toobusy = require('toobusy')
  , app = express()
  , requireIndex = require('requireindex')
  , path = require('path')
  , botPlugins = requireIndex(path.join(__dirname, 'lib', 'bots'))
  , env = require('./lib/env')
  , http = require('http')
  , dict = require('dict')

console.info("env", env);

var bots = dict();
var MAX_BOT_COUNT = parseInt(env.MAX_BOT_COUNT, 10);

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

app.get('/list', function(req, res) {
  res.send(200, Object.keys(botPlugins));
});

app.post('/create', apiKeyMiddleware, function(req, res) {
  var startBot = botPlugins[req.body.type];
  if (! startBot) {
    res.send(400, "Invalid bot type");
    return;
  }
  if (bots.size >= MAX_BOT_COUNT) {
    console.warn("not starting bot:", bots.size, "/", MAX_BOT_COUNT, "bots running");
    res.send(503, "Maximum bot count reached");
    return;
  }
  var bot = startBot({
    port: req.body.port,
    host: req.body.host,
    username: req.body.username,
    password: req.body.password,
    owner: req.body.owner,
  });
  bot.on('end', function() {
    console.info("bot '" + req.body.username + "'ended. owner:",
      req.body.owner, " slots:", bots.size +  "/" + MAX_BOT_COUNT);
    bots.delete(bot.id);
  });
  bots.set(bot.id, bot);
  res.send(200, bot.id);
});

app.post('/destroy', apiKeyMiddleware, function(req, res) {
  var bot = bots.get(req.body.id);
  if (! bot) {
    res.send(404, "Bot not found");
    return;
  }
  console.info("destroying bot", bot.id);
  bot.end();
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
