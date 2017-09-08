const request = require("request");
const debug   = require("debug")('alf');
const uri = 'http://jkom-log.chinacloudapp.cn';

module.exports = (json) => {
  request({
    uri,
    method: 'POST',
    json
  }, (err) => {
    debug('[error] %s', err);
  });
};