var createBot = require('../bot').create;

module.exports = start;

function start(options) {
  return createBot(['./node_modules/.bin/helperbot',
    options.host,
    options.username,
    '--password=' + options.password,
    '--port', options.port,
  ]);
}
