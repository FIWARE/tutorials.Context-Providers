const moment = require('moment');

function monitor(type, message, req, payload) {
	req.app.get('io').emit(type, moment().format('LTS') + ' - ' + message);

	if (payload && Object.keys(payload).length !== 0) {
		req.app.get('io').emit('payload', payload);
	}
}

module.exports = monitor;
