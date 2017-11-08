const request = require("request");


const doRequest = (params, cb) => {
  const { method, url, body } = params;
  const options = {
    uri: url,
    method: method,
    json: true
  };

  if (method === 'GET') {
    options['qs'] = body;
  } else  {
    options['body'] = body;
  }
  request(options, (err, res, body) => {
    cb(err, body, (res && res.statusCode));
  });
};

const flag = false;
if (flag) {
  const param = {
    url: 'http://localhost:9003/ping',
    method: 'GET',
    body: {name: 'tsq'}
  };
  doRequest(param, (err, result) => {
    console.log("err, result", err, result);
  });
}

if (!flag) {
  const param = {
    url: 'http://42.159.241.116:8080/notification',
    method: 'POST',
    body: {
      "recipients":[
        100000002,
        100000003
      ],
      "body":{
        "timestamp":"2017-09-06 23:10:00",
        "routing_key":"agent.add.test",
        "type":"service",
        "title":" Agent XXX added test report for User XXX ! ",
        "content":"",
        "extra":{
          "spId":1,
          "userId":123456,
          "agentId":456789,
          "testId":54321
        }
      },
      "api_key": "34d2263bad91211d598cad52ddfb88c650b34cd03198466e21b7e9c03f6b7195"
    }
  };
  doRequest(param, (err, result) => {
    console.log("err, result", err, result);
  });
}