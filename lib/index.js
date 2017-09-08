const extend      = require("xtend");
const url         = require("url");
const util        = require("util");
const debug       = require("debug")('alf');
const helpers     = require("./helpers");
const collector   = require("./collector");

const Agent = (options) => {
  if (!options.name) {
    throw new Error('name is required');
  }

  this.opts = extend({
    logBody: true,
    limits: {
      bodySize: 10000, //bytes
      retry: 0,
      retryTime: 5, // seconds
      flush: 2, // seconds
      connection: 30 // seconds
    },
    queue: {
      batch: 1,
      entries: 1000 // number of entries per ALF record
    },
    collector: {
      host: 'localhost',
      port: 9002,
      path: '/alf'
    }
  }, options);

  // setup request queue
  // this.queue = new Queue(this.opts);

  return  (req, res, next) =>  {
    let reqReceived = new Date();
    let reqEndFired = false;
    this.clientIPAddress = helpers.getClientAddress(req);

    // body container
    const bytes = {
      req: 0,
      res: 0
    };

    const bodies = {
      req: {
        size: 0,
        base64: ''
      },
      res: {
        size: 0,
        base64: ''
      }
    };

    // buffer container
    const chunked = {
      req: [],
      res: []
    };

    req.on('data',  (chunk) => {
      console.log(1);
      bytes.req += chunk.length;
      if (bytes.req <= this.opts.limits.bodySize) {
        chunked.req.push(chunk);
      }
    });

    req.on('end',  () => {
      console.log(2);

      reqEndFired = true;
      const body = Buffer.concat(chunked.req);
      bodies.req.size = body.length;
      bodies.req.base64 = body ? body.toString() : '';
    });

    // store original methods for later use
    const func = {
      end: res.end,
      write: res.write
    };

    res.write = (chunk, encoding) => {
      func.write.call(res, chunk, encoding);
      bytes.res += chunk.length;

      if (bytes.res <= this.opts.limits.bodySize) {
        chunked.res.push(chunk);
      }
    };

    res.end = (data, encoding) => {
      console.log(3);

      func.end.call(res, data, encoding);

      if (chunked.res.length) {
        chunked.res = chunked.res.map(chunk => {
          if (chunk instanceof Buffer) {
            return chunk;
          }
          return new Buffer(chunk);
        });
        data = Buffer.concat(chunked.res);
      }

      // construct body
      bodies.res.size = data ? data.length : 0;
      bodies.res.base64 = bodies.res.size && data ? data.toString() : '';

      let agentResStartTime = new Date();
      let reqHeadersArr = helpers.objectToArray(req.headers);

      let resHeaders = helpers.parseResponseHeaderString(res._header);

      let resContentLength = parseInt(helpers.getHeaderValue(resHeaders.headersArr, 'content-length'), 10);
      let resBodySize = resContentLength === 0 && bodies.res.size > 0 ? bodies.res.size : resContentLength;


      let reqContentLength = parseInt(helpers.getHeaderValue(reqHeadersArr, 'content-length'), 10);
      let reqBodySize = reqContentLength === 0 && bodies.req.size > 0 ? bodies.req.size : reqContentLength;


      let waitTime = agentResStartTime.getTime() - reqReceived.getTime();
      let protocol = req.connection.encrypted ? 'https' : 'http';

      let entry = {
        time: waitTime,
        startedDataTime: agentResStartTime.toISOString(),
        clientIPAddress: this.clientIPAddress,
        serverIPAddress: helpers.getServerAddress(),
        request: {
          method: req.method,
          url: util.format('%s://%s%s', protocol, req.headers.host, req.url),
          httpVersion: 'HTTP/' + req.httpVersion,
          queryString: helpers.objectToArray(url.parse(req.url, true).query),
          headers: reqHeadersArr,
          headersSize: helpers.getReqHeaderSize(req),
          bodySize: reqBodySize,
          bodyCaptured: !!bodies.req.base64.length,
          postData: null
        },
        response: {
          status: res.statusCode,
          statusText: resHeaders.statusText,
          httpVersion: resHeaders.version,
          headers: resHeaders.headersArr,
          headersSize: res._header ? new Buffer(res._header).length : 0,
          bodySize: resBodySize,
          bodyCaptured: !!bodies.res.base64.length,
          postData: null
        },
        timings: {
          send: 0,
          wait: waitTime,
          receive: 0
        }
      };
      if (this.opts.logBody && bodies.req.base64.length) {
        entry.request.postData = {
          mimeType: req.headers['content-type'],
          text: bodies.req.base64,
          encoding: 'base64'
        }
      }
      if (this.opts.logBody && bodies.res.base64.length) {
        let contentType = 'text/plain';
        if (res._header && res._header.indexOf('Content-Type:')) {
          contentType = res._header.split('Content-Type: ')[1].split('\r\n')[0]
        }
        entry.response.postData = {
          mimeType: contentType,
          text: bodies.res.base64,
          encoding: 'base64'
        }
      }
      debug('[entry]: %s', JSON.stringify(entry, null, 2));
      collector({body: entry, name: options.name});
    };

    next();
  }
};

module.exports = Agent;
