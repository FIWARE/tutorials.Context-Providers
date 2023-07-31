/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

//const _ = require('lodash');

const Constants = require('../lib/constants');
const _ = require('lodash');

function formatSubscription(json) {
    const notification = json.notification || {};
    const endpoint = notification.endpoint || {};
    const q = json.q ? json.q.replace(/"/gi, '').replace(/%22/gi, '') : undefined;

    let entities;

    if (json.entities) {
        entities = _.map(json.entities, (entity) => {
            if (entity.id) {
                return entity;
            } else if (entity.type && !entity.idPattern) {
                return { type: entity.type, idPattern: '.*' };
            }
            return entity;
        });
    }

    const obj = {
        type: 'Subscription',
        description: json.description
    };

    if (q) {
        obj.subject = obj.subject || {};
        obj.subject.condition = obj.subject.condition || {};
        obj.subject.condition.expression = obj.subject.condition.expression || {};
        obj.subject.condition.expression.q = q;
    }
    if (json.entities) {
        obj.subject = obj.subject || {};
        obj.subject.entities = entities;
    }
    if (json.watchedAttributes) {
        obj.subject = obj.subject || {};
        obj.subject.condition = obj.subject.condition || {};
        obj.subject.condition.attrs = json.watchedAttributes;
    }
    if (notification.format) {
        obj.notification = obj.notification || {};
        obj.notification.attrsFormat = notification.format;
    }
    if (endpoint.uri) {
        obj.notification = obj.notification || {};
        obj.notification.httpCustom = obj.notification.httpCustom || {};
        obj.notification.httpCustom.headers = obj.notification.httpCustom.headers || {};
        obj.notification.httpCustom.url = Constants.NOTIFICATION_RELAY_URL;
        obj.notification.httpCustom.headers.target = endpoint.uri;
    }
    if (endpoint.accept) {
        obj.notification = obj.notification || {};
        obj.notification.httpCustom = obj.notification.httpCustom || {};
        obj.notification.httpCustom.headers = obj.notification.httpCustom.headers || {};
        obj.notification.httpCustom.headers.target_accept = endpoint.accept;
    }

    console.log(obj);

    return obj;
}

module.exports = {
    formatSubscription
};
