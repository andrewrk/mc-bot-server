var spawn = require('child_process').spawn
  , EventEmitter = require('events').EventEmitter
  , makeUuid = require('node-uuid')

exports.create = createBot;

function createBot(clArgs) {
  var bot = new EventEmitter();

  console.info("spawning", process.argv[0], clArgs);
  var exe = spawn(process.argv[0], clArgs, {
    stdio: 'inherit',
  });
  exe.on('exit', function(code) {
    bot.emit('end');
  });
  exe.on('error', function(err) {
    console.error("Error running bot:", err.stack);
    exe.kill();
  });

  bot.id = makeUuid();
  bot.end = function() {
    exe.kill();
  };


  return bot;
}
