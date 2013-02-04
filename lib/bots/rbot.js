var createBot = require('../bot').create;

module.exports = start;

function start(options) {
  var args = [
    './node_modules/rbot/rbot.js',
    options.host,
    options.port,
    options.username,
    '',
    options.owner
  ];
  return createBot(args);
}
