const express = require('express');
const router = express.Router();

const StaticNGSIProxy = require('../controllers/static');
const RandomNGSIProxy = require('../controllers/random');
const TwitterNSGIProxy = require('../controllers/twitter');
const WeatherNSGIProxy = require('../controllers/wunderground');

router.get('/random/health', RandomNGSIProxy.healthCheck);
router.post('/random/:type/queryContext', RandomNGSIProxy.queryContext);

router.get('/static/health', StaticNGSIProxy.healthCheck);
router.post('/static/:type/queryContext', StaticNGSIProxy.queryContext);

router.get('/twitter/health', TwitterNSGIProxy.healthCheck);
router.post('/twitter/:type/:queryString/:attr/queryContext', TwitterNSGIProxy.queryContext);

router.get('/weather/health', WeatherNSGIProxy.healthCheck);
router.post('/weather/:type/:queryString/:attr/queryContext', WeatherNSGIProxy.queryContext);

module.exports = router;
