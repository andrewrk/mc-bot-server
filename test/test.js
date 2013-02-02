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
env.MAX_BOT_COUNT = 1;

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
      var exe = spawn("./node_modules/.bin/naught", ["start", "server.js"], {
        env: env,
      });
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
    server = null;
  });
  function startBotTest(type, done) {
    var id;
    server.once('login', function(client) {
      assert.ok(client.username === 'test1234');
      var request = superagent.post(ENDPOINT + '/destroy');
      request.send({
        apiKey: VALID_API_KEY,
        id: id,
      });
      request.end(function (err, resp) {
        assert.ifError(err);
        assert.ok(resp.ok, "/destroy " + resp.status + " " + resp.text);
        done();
      });
    });
    var request = superagent.post(ENDPOINT + '/create');
    request.send({
      apiKey: VALID_API_KEY,
      type: type,
      username: 'test1234',
      host: 'localhost',
      port: '25565',
      owner: 'superjoe30',
    });
    request.end(function(err, resp) {
      assert.ifError(err);
      assert.ok(resp.ok, "/create " + resp.status + " " + resp.text);
      id = resp.text;
    });
  }
  describe("starting bots", function() {
    it("archer", function(done) {
      startBotTest('archer', done);
    });
    it("helper");
  });
  it("400 when bad api key", function(done) {
    var request = superagent.post(ENDPOINT + '/create');
    request.send({
      apiKey: "invalid api key",
      type: 'archer',
      username: 'test1234',
      host: 'localhost',
      port: '25565',
      owner: 'superjoe30',
    });
    request.end(function(err, resp) {
      assert.ifError(err);
      assert.strictEqual(resp.status, 400);
      done();
    });
  });
  it("limits bot count", function(done) {
    var request = superagent.post(ENDPOINT + '/create');
    request.send({
      apiKey: VALID_API_KEY,
      type: 'archer',
      username: 'test1234',
      host: 'localhost',
      port: '25565',
      owner: 'superjoe30',
    });
    request.end(function(err, resp) {
      assert.ifError(err);
      assert.strictEqual(resp.status, 200, "/create " + resp.status + " " + resp.text);
      var id = resp.text;
      var request = superagent.post(ENDPOINT + '/create');
      request.send({
        apiKey: VALID_API_KEY,
        type: 'archer',
      });
      request.end(function(err, resp) {
        assert.ifError(err);
        assert.strictEqual(resp.status, 503);
        var request = superagent.post(ENDPOINT + '/destroy');
        request.send({
          apiKey: VALID_API_KEY,
          id: id,
        });
        request.end(function(err, resp) {
          assert.ifError(err);
          assert.strictEqual(resp.status, 200, "/destroy " + resp.status + " " + resp.text);
          done();
        });
      });
    });
  });
});
