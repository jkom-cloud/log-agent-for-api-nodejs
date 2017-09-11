const request = require("request");
const debug   = require("debug")('alf');

module.exports = (config, json) => {
  request({
    uri: config.collector,
    method: 'POST',
    json
  }, (err) => {
    debug('[error] %s', err);
  });
};