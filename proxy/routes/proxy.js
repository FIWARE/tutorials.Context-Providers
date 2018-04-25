const express = require('express');
const router = express.Router();

const StaticNGSIProxy = require('../controllers/static');
const RandomNGSIProxy = require('../controllers/random');
const TwitterNSGIProxy = require('../controllers/twitter');
const WeatherNSGIProxy = require('../controllers/wunderground');


router.get('/random/health', RandomNGSIProxy.healthCheck);
router.get('/static/health', StaticNGSIProxy.healthCheck);
router.get('/twitter/health', TwitterNSGIProxy.healthCheck);
router.get('/weather/health', WeatherNSGIProxy.healthCheck);

router.post('/random/:type/:mapping/queryContext', RandomNGSIProxy.queryContext);

router.post('/static/:type/:mapping/queryContext', StaticNGSIProxy.queryContext);
router.post('/twitter/:type/:mapping/:queryString/queryContext', TwitterNSGIProxy.queryContext);
router.post('/weather/:type/:mapping/:queryString/queryContext', WeatherNSGIProxy.queryContext);

router.get('/', (req, res) => {
	res.status(200).send({
		health_url: "/proxy/health",
		context_url: "/proxy/queryContext",
	});
});


router.get('/health', (req, res) => {
	res.status(200).send({
		health_urls: [
			"/proxy/random/health",
			"/proxy/static/health",
			"/proxy/weather/health",
			"/proxy/twitter/health",
		]
	});
});

router.get('/queryContext', (req, res) => {
	res.status(200).send({
		context_urls: [
			"/proxy/random/:type/:mapping/queryContext",
			"/proxy/static/:type/:mapping/queryContext",
			"/proxy/twitter/:type/:mapping/:queryString/queryContext",
			"/proxy/twitter/:type/:mapping/:queryString/queryContext",
		],
	});
});


module.exports = router;
