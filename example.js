const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const agent = require("./lib/index");

app.use(agent({name: 'socket'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.all('/ping', (req, res) => {
  res.json({success: true});
});

app.listen(9003);