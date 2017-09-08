const OS  = require('os');

// Priority
const ipHeaders = [
  'forwarded',
  'x-real-ip',
  'x-forwarded-for'
];

// get server address from network interface
const getServerAddress = (testOverride) => {
  let ret = '127.0.0.1';
  let os = testOverride || OS;
  let interfaces = os.networkInterfaces();

  Object.keys(interfaces).forEach(el => {
    interfaces[el].forEach(el2 => {
      if (!el2.internal && el2.family === 'IPv4') {
        ret = el2.address;
      }
    });
  });
  return ret;
};

const getClientAddress = (req) => {
  let address;
  ipHeaders.reverse().forEach(header => {
    address = req.headers[header] || address;
  });
  
  if (!address) {
    if (req.connection && req.connection.remoteAddress) {
      address = req.connection.remoteAddress;
    } else if (req.connection && req.connection.socket && req.connection.socket.remoteAddress) {
      address = req.connection.socket.remoteAddress;
    } else if (req.socket && req.socket.remoteAddress) {
      address = req.socket.remoteAddress;
    } else {
      address = '';
    }
  }
  if (address && typeof address === 'string' && address.indexOf(',') > -1) {
    address = address.split(',')[0];
  }
  return address;
};

// convert header string to assoc array
const parseResponseHeaderString = (string) => {
  if (!string || string.indexOf('\r\n') === -1) {
    return {
      version: 'HTTP/1.1',
      statusText: ''
    };
  }

  let lines = string.split('\r\n');
  let status = lines.shift();

  // Remove empty strings
  lines = lines.filter(Boolean);

  // Parse status line
  let output = parseStartLine(status);

  // init headers object & array
  output.headersObj = {};
  output.headersArr = [];

  // Parse headers
  let header;
  for (let i = 0; i < lines.length; i++) {
    header = parseHeaderLine(lines[i]);
    output.headersArr.push(header);
    output.headersObj[header.name] = header.value;
  }
  return output;
};

// parse status line into an object
const parseStartLine = (line) => {
  const pieces = line.split(' ');

  // Header string pieces
  const output = {
    version: pieces.shift(),
    status: parseFloat(pieces.shift()),
    statusText: pieces.join(' ')
  };

  return output;
};

const parseHeaderLine = (line) => {
  const pieces = line.split(': ');
  const name = pieces.shift();
  const value = pieces.join(': ');
  return { name, value };
};

// Transfrom objects into an array of key value pairs
const objectToArray = (obj) => {
  const results = [];

  Object.keys(obj).forEach(name => {
    results.push({
      name,
      value: obj[name]
    });
  });
  return results;
};

// uses regex to match a header value
const getHeaderValue = (headers, key, def) => {
  if (headers instanceof Array) {
    const regex = new RegExp(key, 'i');
    for (var i = 0; i < headers.length; i++) {
      if (regex.test(headers[i].name)) {
        return headers[i].value
      }
    }
  }
  return def !== undefined ? def : false
};

// quickly calculates the header size in bytes for a given array of headers

const getReqHeaderSize = (req) => {
  const keys = Object.keys(req.headers);
  const values = keys.map(key => req.headers[key]);
  const headers = req.method + req.url + keys.join() + values.join();
  // startline: [method] [url] HTTP/1.1\r\n = 12
  // endline: \r\n = 2
  // every header + \r\n = * 2
  // add 2 for each combined header
  return new Buffer(headers).length + (keys.length * 2) + 2 + 12 + 2;
};

// get unique elements of an array

const uniq = (arr) => {
  const hash = {};
  const result = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    if (!hash.hasOwnProperty(arr[i])) {
      hash[arr[i]] = true;
      result.push(arr[i]);
    }
  }
  return result;
};

const obj = {
  getServerAddress,
  getClientAddress,
  parseResponseHeaderString,
  parseStartLine,
  parseHeaderLine,
  objectToArray,
  getHeaderValue,
  getReqHeaderSize,
  uniq
};

module.exports = obj;