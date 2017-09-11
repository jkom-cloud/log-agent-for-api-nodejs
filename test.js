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
    url: 'http://localhost:9003/ping',
    method: 'POST',
    body: {
      "max": 6.06,
      "min": 3.76
    }
  };
  doRequest(param, (err, result) => {
    console.log("err, result", err, result);
  });
}