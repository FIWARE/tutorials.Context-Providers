const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const PROXY_URL = process.env.PROXY || 'http://localhost:1027/v2';
const debug = require('debug')('proxy:subscriptions');
const got = require('got');
const convert = require('../lib/convert');

async function listSubscriptions(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            retry: 0
        };
        const response = await got(PROXY_URL + req.path, options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        res.headers['content-type'] = contentType;
        res.type(contentType);
        let ldPayload = [];
        const body = JSON.parse(response.body);

        if (body instanceof Array) {
            const filtered = _.filter(body || [], function (sub) {
                return sub.notification.httpCustom;
            });
            ldPayload = _.map(filtered, (sub) => {
                return convert.formatSubscription(sub, bodyIsJSONLD);
            });
        }

        return body ? res.send(ldPayload) : res.send();
    } catch (error) {
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
    }
}
async function readSubscription(req, res) {
    const bodyIsJSONLD = req.get('Accept') === 'application/ld+json';
    const contentType = bodyIsJSONLD ? 'application/ld+json' : 'application/json';
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            retry: 0
        };
        const response = await got(PROXY_URL + '/subscriptions/' + id, options);

        res.statusCode = response.statusCode;
        res.headers = response.headers;
        res.headers['content-type'] = contentType;
        res.type(contentType);
        let ldPayload = [];
        const body = JSON.parse(response.body);
        ldPayload = convert.formatSubscription(body, bodyIsJSONLD);
        return body ? res.send(ldPayload) : res.send();
    } catch (error) {
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
    }
}
async function deleteSubscription(req, res) {
    const id = req.params.id.replace(/urn:ngsi-ld:Subscription:/gi, '');

    try {
        const options = {
            method: req.method,
            throwHttpErrors: false,
            retry: 0
        };
        const response = await got(PROXY_URL + '/subscriptions/' + id, options);
        res.statusCode = response.statusCode;
        res.headers = response.headers;
        return res.send();
    } catch (error) {
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
    }
}
function updateSubscription(req, res) {}

exports.list = listSubscriptions;
exports.read = readSubscription;
exports.delete = deleteSubscription;
exports.update = updateSubscription;
