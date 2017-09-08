const request = require("request");
const debug   = require("debug")('alf');
const uri = 'http://jkom-log.chinacloudapp.cn:7777/message';

module.exports = (json) => {
  request({
    uri,
    method: 'POST',
    json
  }, (err) => {
    debug('[error] %s', err);
  });
};