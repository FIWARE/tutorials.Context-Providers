const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const debug = require('debug')('proxy:subscriptions');
const got = require('got');

const Constants = require('../lib/constants');
const NGSI_LD = require('../lib/ngsi-ld');
const NGSI_V2 = require('../lib/ngsi-v2');

async function listSubscriptions(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL() + req.path, options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            res.headers['content-type'] = contentType;
            res.type(contentType);
            Constants.linkContext(res, bodyIsJSONLD);
            let ldPayload = [];
            const body = JSON.parse(response.body);

            if (body instanceof Array) {
                const filtered = _.filter(body || [], function (sub) {
                    return sub.notification.httpCustom;
                });
                ldPayload = _.map(filtered, (sub) => {
                    return NGSI_LD.formatSubscription(sub, bodyIsJSONLD);
                });
            }

            return body ? res.send(ldPayload) : res.send();
        })
        .catch((error) => {
            debug(error);
            return error.code !== 'ENOTFOUND'
                ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                      title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                      message: `${req.path} caused an error:  ${error.code}`
                  })
                : res.status(StatusCodes.NOT_FOUND).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                      title: getReasonPhrase(StatusCodes.NOT_FOUND),
                      message: `${req.path} is unavailable`
                  });
        });
}
async function readSubscription(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL() + '/subscriptions/' + id, options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            res.headers['content-type'] = contentType;
            res.type(contentType);
            Constants.linkContext(res, bodyIsJSONLD);
            let ldPayload = [];
            const body = JSON.parse(response.body);
            ldPayload = NGSI_LD.formatSubscription(body, bodyIsJSONLD);
            return body ? res.send(ldPayload) : res.send();
        })
        .catch((error) => {
            debug(error);
            return error.code !== 'ENOTFOUND'
                ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                      title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                      message: `${req.path} caused an error:  ${error.code}`
                  })
                : res.status(StatusCodes.NOT_FOUND).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                      title: getReasonPhrase(StatusCodes.NOT_FOUND),
                      message: `${req.path} is unavailable`
                  });
        });
}

async function deleteSubscription(req, res) {
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');
    const options = {
        method: req.method,
        throwHttpErrors: false,
        retry: 0
    };

    got(Constants.v2BrokerURL() + '/subscriptions/' + id, options)
        .then((response) => {
            res.statusCode = response.statusCode;
            res.headers = response.headers;
            return res.send();
        })
        .catch((error) => {
            debug(error);
            return error.code !== 'ENOTFOUND'
                ? res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/InternalError',
                      title: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
                      message: `${req.path} caused an error:  ${error.code}`
                  })
                : res.status(StatusCodes.NOT_FOUND).send({
                      type: 'https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound',
                      title: getReasonPhrase(StatusCodes.NOT_FOUND),
                      message: `${req.path} is unavailable`
                  });
        });
}

function createSubscription(req, res) {
    let v2Payload = NGSI_V2.formatSubscription(req.body);
    return res.send(v2Payload);
}

function updateSubscription(req, res) {
    let v2Payload = NGSI_V2.formatSubscription(req.body);
    return res.send(v2Payload);
}

exports.list = listSubscriptions;
exports.read = readSubscription;
exports.create = createSubscription;
exports.delete = deleteSubscription;
exports.update = updateSubscription;
