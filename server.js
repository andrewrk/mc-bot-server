var express = require('express')
  , toobusy = require('toobusy')
  , app = express()
  , requireIndex = require('requireindex')
  , path = require('path')
  , bots = requireIndex(path.join(__dirname, 'lib', 'bots'))

var env = {
  PORT: process.env.PORT || 11476,
  HOST: process.env.HOST || '0.0.0.0',
  API_KEY: process.env.API_KEY || '43959b30-6cd8-11e2-bcfd-0800200c9a66',
};

app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, "Too busy");
  } else {
    next();
  }
});

app.use(express.json());

app.use(function(req, res, next) {
  if (req.body.apiKey === env.API_KEY) {
    next();
  } else {
    res.send(400, "Bad API key");
  }
});

app.post('/create', function(req, res) {
  var bot = bots[req.body.type];
  if (! bot) {
    res.send(400, "Invalid bot type");
    return;
  }
  res.send(200, "OK");
});

