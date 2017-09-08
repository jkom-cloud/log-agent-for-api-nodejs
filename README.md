# JKOM LOG Node Agent

Collect and send request records to `JKOM LOG` for aggregation / logging


## Installation

``` sh
npm install jkom-cloud/log-agent-for-api-nodejs --save
```

## Usage

``` js
var express = require('express')
var agent = require('agent-node')

var app = express()

app.use(agent({name: 'socket'});

app.get('/api', function (req, res) {
  res.send('Hello World!')
})

app.listen()
```
