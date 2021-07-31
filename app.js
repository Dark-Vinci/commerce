const express = require('express');
const winston = require('winston');
const app = express();

require('./appManager')(app)

const port = process.env.PORT || 2022;
app.listen(port, () => winston.info(`listening at port ${ port }`))