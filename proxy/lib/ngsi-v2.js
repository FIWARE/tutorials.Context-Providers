/*
 * Copyright 2021 -  Universidad Politécnica de Madrid.
 *
 * This file is part of PEP-Proxy
 *
 */

//const config_service = require('./config_service');
//const config = config_service.get_config();
const debug = require('debug')('proxy:convert');
const got = require('got');
const StatusCodes = require('http-status-codes').StatusCodes;
const getReasonPhrase = require('http-status-codes').getReasonPhrase;
const _ = require('lodash');
const moment = require('moment-timezone');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');


const Constants = require('../lib/constants');

function formatSubscription(json, bodyIsJSONLD) {
    const condition = json.subject.condition || {};
    const expression = condition.expression || {};
    const notification = json.notification || {};

    const obj = {
        type: 'Subscription',
        description: json.description,
        subject: {
            entities: json.entities,
            condition: {
                attrs: json.watchedAttributes,
                expression: { q: json.q }
            }
        },
        notification: {
            httpCustom: {
                url: Constants.RELAY_URL,
                headers: {
                    target: notification.uri
                }
            },
            attrsFormat: notification.format
        }
    };

    return obj;
}

module.exports = {
    formatSubscription
}
