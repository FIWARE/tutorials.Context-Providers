
//
// This controlller is simulates a series of devices using the Ultralight protocol
//
// Ultralight 2.0 is a lightweight text based protocol aimed to constrained devices and communications 
// where the bandwidth and device memory may be limited resources.
//
// A device can report new measures to the IoT Platform using an HTTP GET request to the /iot/d path with the following query parameters:
//
//  i (device ID): Device ID (unique for the API Key).
//  k (API Key): API Key for the service the device is registered on.
//  t (timestamp): Timestamp of the measure. Will override the automatic IoTAgent timestamp (optional).
//  d (Data): Ultralight 2.0 payload.
//
// At the moment the API key and timestamp are unused by the simulator.

/* global SOCKET_IO */
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const _ = require('lodash');
const createError = require('http-errors');

//
// Check to see if the  Device ID parameter has been sent,
// and the device is one of the 16 devices registered by default
//
function preprocess(req, res, next){
	res.locals.deviceId = req.query.i;
	if(!res.locals.deviceId){
		return res.status(422).send(new createError.UnprocessableEntity());
	} 
	if(_.indexOf(myCache.keys(),res.locals.deviceId) === -1){
		return res.status(404).send(new createError.NotFound());
	}
	return next();
}

// A device can report new measures to the IoT Platform using an HTTP GET request 
// to the /iot/d path.
// Payloads for GET requests should not contain multiple measure groups
function processGetRequest(req, res) {
	const state = updateSensorState(res, req, req.query.d);
	return res.status(200).send(state);	
}

// Another way of reporting measures is to do it using a POST request. 
// In this case, the payload is passed along as the request payload. 
// The device ID query parameter is still mandatory
function processPostRequest(req, res) {
	const state = updateSensorState(res, req, req.body)
	return res.status(200).send(state);	
}

// Set up 16 sensors, a door, bell, motion sensor and lamp for each of 4 locations.
//
// The door can be OPEN CLOSED or LOCKED
// The bell can be ON or OFF
// The motion sensor counts the number of people passing by
// The lamp can be ON or OFF. This also registers luminocity.
// It will slowly dim as time passes (provided no movement is detected)
function initSensorState (){
	myCache.set( 'door001', 's|LOCKED');
	myCache.set( 'door002', 's|LOCKED');
	myCache.set( 'door003', 's|LOCKED');
	myCache.set( 'door004', 's|LOCKED');

	myCache.set( 'bell001', 's|OFF');
	myCache.set( 'bell002', 's|OFF');
	myCache.set( 'bell003', 's|OFF');
	myCache.set( 'bell004', 's|OFF');

	myCache.set( 'lamp001', 's|OFF,l|0');
	myCache.set( 'lamp002', 's|OFF,l|0');
	myCache.set( 'lamp003', 's|OFF,l|0');
	myCache.set( 'lamp004', 's|OFF,l|0');

	myCache.set( 'motion001', 'c|0');
	myCache.set( 'motion002', 'c|0');
	myCache.set( 'motion003', 'c|0');
	myCache.set( 'motion004', 'c|0');
}

// Amend the cache value holding the state of the device if the payload
// has been set.
function updateSensorState(res, req, payload){
	const deviceId = res.locals.deviceId;
	if(payload){
		myCache.set( deviceId, payload);
	}
	const state = myCache.get(deviceId);
	SOCKET_IO.emit(deviceId, state);
	return state;
}

//
// Transformation function from Ultralight Protocol to a state object
// Ultralight is a series of comma separated key-value pairs.
// Each key and value is in turn separated by a pipe character
//
// e.g. s|ON,l|1000 becomes
// { s: 'ON', l: '1000'}
//
function toStateObject (ultraLight){
	const obj = {};
	const keyValuePairs = ultraLight.split(',')
	_.forEach(keyValuePairs, function(value) {
		const splitArr = value.split('|');

		if (splitArr.length === 2){
			obj[splitArr[0]] = splitArr[1];
		}

	});
	return obj;
}

// Transformation function from a state object to the Ultralight Protocol
// Ultralight is a series of comma separated key-value pairs.
// Each key and value is in turn separated by a pipe character
//
// e.g. s|ON,l|1000
function toUltraLight (object){
	const strArray = [];
	_.forEach(object, function(value, key) {
		strArray.push(key + '|' + value);
	});
	return strArray.join (',');
}

// Return the state of the door with the same number as the current element
// this is because no people will enter if the door is LOCKED, and therefore
// both the motion sensor will not increment an the smart lamp will slowly
// decrease
function getDoorState (deviceId, type){
	const door = toStateObject(myCache.get(deviceId.replace(type, 'door')));
	return  door.s || 'LOCKED';
}

// Pick a random number between 1 and 10
function getRandom (){
	return  Math.floor(Math.random() * 10) + 1;
}

// Initialize the array of sensors and periodically update them.
initSensorState ();
let isRunning = false;
setInterval(function(){
    if(!isRunning){
        isRunning = true;

        const deviceIds = myCache.keys();

		_.forEach(deviceIds, function(deviceId) {
			const state = toStateObject(myCache.get(deviceId));

			switch (deviceId.replace(/\d/g, '')){
				case "door":
					//  The door is OPEN or CLOSED or LOCKED,
					if(state.s !== 'LOCKED'){
						// Randomly open and close the door if not locked
						state.s = (getRandom() > 4) ? 'OPEN' : 'CLOSED';
					}
					break;
				case "bell":
					// ON or OFF - Switch off the bell if it is still ringing
					if(state.s === 'ON'){
						state.s = 'OFF';
					}	
					break;				
				case "motion":
					// If the door is OPEN, randomly increment the count of the motion sensor
					if(getDoorState (deviceId, 'motion') === 'OPEN'){
						state.c =  parseInt(state.c) + ((getRandom() > 3) ? 1 : 0);
					}
					break;

				case "lamp":
					if(state.s === 'OFF'){
						state.l = 0;
					} else if(getDoorState (deviceId, 'lamp') === 'OPEN'){
						// if the door is open set the light to full power
						state.l =  2000;
					} else if (state.l > 1000){
						// if the door is closed dim the light
						state.l = parseInt(state.l) || 2000;
						state.l = state.l - 100;
					}
					break;	
			}

			myCache.set(deviceId, toUltraLight(state));
			SOCKET_IO.emit(deviceId, toUltraLight(state));
		});
		
       isRunning = false;
    }
}, 3000);




module.exports = {
	preprocess,
	processGetRequest,
	processPostRequest,
};