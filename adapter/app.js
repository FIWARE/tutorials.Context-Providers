const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const nocache = require('nocache');


const app = express();
app.disable('x-powered-by');
app.set("etag", false);

app.use(logger('dev'));
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/*+json' }));
// Never cache
app.use(nocache());

app.use('/ngsi-ld/v1', indexRouter);
app.use('//ngsi-ld/v1', indexRouter);

module.exports = app;
