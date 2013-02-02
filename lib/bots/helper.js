var createBot = require('../bot').create;

module.exports = start;

function start(options) {
  var args = ['./node_modules/.bin/helperbot', options.host, options.username];
  if (options.password) args.push('--password=' + options.password);
  if (options.port) args.push('--port=' + options.port);
  return createBot(args);
}
