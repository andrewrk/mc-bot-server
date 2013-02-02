var createBot = require('../bot').create;

module.exports = start;

function start(options) {
  var args = ['./node_modules/.bin/archerbot'];
  if (options.username) args.push('--username', options.username);
  if (options.password) args.push('--password', options.password);
  if (options.host) args.push('--host', options.host);
  if (options.port) args.push('--port', options.port);
  return createBot(args);
}
