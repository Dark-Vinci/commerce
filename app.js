const express = require('express');
const winston = require('winston');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 500000 }))
require('./appManager')(app)

const port = process.env.PORT || 2022;
const server = app.listen(port, () => winston.info(`listening at port ${ port }`));
module.exports = server;