This is a simple nodejs express application which offers an NGSI v1 proxy interface to four context providers.


# QueryContext Endpoints

The following NGSI v1 endpoints are supported

* `/random/<type>/queryContext`. 
  returns random data  values of `"type": "<type>"`  - e.g. `/random/Text/queryContext` will return  random lorem ipsum

* `/static/<type>/queryContext`
  returns static data  values of `"type": "<type>"`  - e.g. `/static/Text/queryContext` will return "I never could get the hang of thursdays"

* `/twitter/<type>/<attr>/queryContext`
  Work in progress

* `/weather/<type>/<attr>/queryContext`
  Work in progress


# Health Check Endpoints

The following health check endpoints are supported:

* `/random/health`
  A non-error response shows that an NGSI proxy is available on the network and returning values.
  Each Request will return some random dummy data.


* `/static/health`
  A non-error response shows that an NGSI proxy is available on the network and returning values.
  Each Request will return the same data.


* `/twitter/health`
  A non-error response shows that an NGSI proxy for the Twitter API is available on the network and returning values.

  If the proxy is correctly configured to connect to the Twitter API, a series of Tweets will be returned.

  The Twitter API uses OAuth2: 

  * To get Consumer Key & Consumer Secret for the Twitter API, you have to create an app in Twitter via [https://apps.twitter.com/app/new](https://apps.twitter.com/app/new). Then you'll be taken to a page containing Consumer Key & Consumer Secret.
  * For more information see: [https://developer.twitter.com/](https://developer.twitter.com/)


* `/weather/health`
  A non-error response shows that an NGSI proxy for the Weather API is available on the network and returning values.

  If the proxy is correctly configured to connect to the Weather Underground API, the current weather in Berlin will be returned.

  Most of the Weather API features require an API key. 

  * Sign up for a key at [https://www.wunderground.com/weather/api/](https://www.wunderground.com/weather/api/)
  * For more information see: [https://www.wunderground.com/weather/api/d/docs?MR=1](https://www.wunderground.com/weather/api/d/docs?MR=1)


# Keys and Secrets

All Keys and Secrets must be passed in using Environment variables. The following  variables **must** be provided

* `WUNDERGROUND_KEY_ID=<ADD_YOUR_KEY_ID>`
* `TWITTER_CONSUMER_KEY=<ADD_YOUR_CONSUMER_KEY>`
* `TWITTER_CONSUMER_SECRET=<ADD_YOUR_CONSUMER_SECRET>`