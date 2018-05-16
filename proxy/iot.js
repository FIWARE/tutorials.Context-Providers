const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const Ultralight = require('./controllers/ultraLight');

const iot = express();
const ultraLightRouter = express.Router();
ultraLightRouter.get('/', Ultralight.preprocess, Ultralight.processGetRequest);
ultraLightRouter.post('/', Ultralight.preprocess, Ultralight.processPostRequest);


iot.use(express.json());
iot.use(express.urlencoded({ extended: false }));
// parse text/plain
iot.use(bodyParser.text());
iot.use('/iot/d', ultraLightRouter);

// catch 404 and forward to error handler
iot.use(function(req, res) {
	res.status(404).send(new createError.NotFound());
});


module.exports = iot;
