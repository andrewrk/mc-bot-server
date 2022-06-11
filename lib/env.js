var os = require('os');

module.exports = {
  PORT: process.env.PORT || 53675,
  HOST: process.env.HOST || '112fun.aternos.me',
  API_KEY: process.env.API_KEY || '43959b30-6cd8-11e2-bcfd-0800200c9a66',
  NODE_ENV: process.env.NODE_ENV = process.env.NODE_ENV || 'dev',
  MAX_BOT_COUNT: process.env.MAX_BOT_COUNT || os.cpus().length * 2,
};
