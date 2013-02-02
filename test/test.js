var spawn = require('child_process').spawn
  , mc = require('minecraft-protocol')
  , Batch = require('batch')
  , fs = require('fs')
  , env = require('../lib/env')
  , url = require('url')
  , http = require('http')
  , assert = require('assert')
  , superagent = require('superagent')

var ENDPOINT = 'http://' + env.HOST + ':' + env.PORT;
var VALID_API_KEY = env.API_KEY;

describe("bootup", function() {
  before(function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["stop"]);
    exe.on('exit', function() { done(); });
  });
  after(function(done) {
    var batch = new Batch();
    batch.push(function(done) { fs.unlink("naught.log", done); });
    batch.push(function(done) { fs.unlink("stderr.log", done); });
    batch.push(function(done) { fs.unlink("stdout.log", done); });
    batch.end(done);
  });
  it("boots", function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["start", "server.js"], {
      stdio: 'pipe',
      env: env,
    });
    var stderr = "";
    exe.stderr.setEncoding('utf8');
    exe.stderr.on('data', function(data) {
      stderr += data;
    });
    exe.on('close', function(code) {
      if (code === 0) {
        done();
      } else {
        console.error("naught stderr:", stderr);
        done(new Error("could not boot server"));
      }
    });
  });
  it("responds to healthcheck endpoint", function(done) {
    http.get(url.parse(ENDPOINT + "/"), function(resp) {
      assert.strictEqual(resp.statusCode, 200);
      done();
    });
  });
  it("deploys code", function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["deploy"], {
      stdio: 'pipe'
    });
    var stderr = "";
    exe.stderr.setEncoding('utf8');
    exe.stderr.on('data', function(data) {
      stderr += data;
    });
    exe.on('exit', function(code) {
      if (code === 0) {
        done();
      } else {
        console.error("naught stderr:", stderr);
        done(new Error("could not deploy server"));
      }
    });
  });
  it("shuts down", function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["stop"], {
      stdio: 'pipe'
    });
    var stderr = "";
    exe.stderr.setEncoding('utf8');
    exe.stderr.on('data', function(data) {
      stderr += data;
    });
    exe.on('close', function(code) {
      if (code === 0) {
        done();
      } else {
        console.error("naught stderr:", stderr);
        done(new Error("could not shut down server"));
      }
    });
  });
});

describe("mc-bot-server", function() {
  before(function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["stop"]);
    exe.on('exit', function() {
      var exe = spawn("./node_modules/.bin/naught", ["start", "server.js"]);
      exe.on('exit', function() { done(); });
    });
  });
  after(function(done) {
    var exe = spawn("./node_modules/.bin/naught", ["stop"]);
    exe.on('exit', function() {
      var batch = new Batch();
      batch.push(function(done) { fs.unlink("naught.log", done); });
      batch.push(function(done) { fs.unlink("stderr.log", done); });
      batch.push(function(done) { fs.unlink("stdout.log", done); });
      batch.end(done);
    });
  });
  describe("starting bots", function() {
    var server;
    beforeEach(function(done) {
      server = mc.createServer({
        'online-mode': false
      });
      server.on('listening', done);
    });
    afterEach(function(done) {
      server.on('close', done);
      server.close();
    });
    it("archer", function(done) {
      startBotTest('archer', done);
    });
    it("helper");
  });
  it("limits bot count");
  it("400 when bad api key", function(done) {
    var request = superagent.post(ENDPOINT + '/create');
    request.send({
      apiKey: "invalid api key",
      type: 'archer',
    });
    request.end(function(err, resp) {
      assert.ifError(err);
      assert.strictEqual(resp.status, 400);
      done();
    });
  });
});

function startBotTest(type, done) {
  var request = superagent.post(ENDPOINT + '/create');
  request.send({
    apiKey: VALID_API_KEY,
    type: type,
  });
  request.end(function(err, resp) {
    assert.ifError(err);
    assert.ok(resp.ok, "/create " + resp.status + " " + resp.text);
    done();
  });
}
