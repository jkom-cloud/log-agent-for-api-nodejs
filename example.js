const express = require("express");
const app = express();

const agent = require("./lib/index");
app.use(agent({name: 'socket'}));

app.all('/ping', (req, res) => {
  res.json({success: true});
});

app.listen(9003);