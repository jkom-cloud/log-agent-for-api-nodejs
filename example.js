const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const app = express();

const agent = require("./lib/index");
// app.use(morgan('combined'));
app.use(agent({name: 'socket'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('json spaces', 2);
app.use(express.static('public/'));
app.use(cors());
app.use(compression());
// app.use(helmet());
app.all('/ping', (req, res) => {
  res.json({success: true});
});

app.listen(9003);
console.log('listening on', 9003);