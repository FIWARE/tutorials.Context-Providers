/*
 * Copyright 2023 -  FIWARE Foundation e.V.
 *
 * This file is part of NGSI-LD to NGSI-v2 Adapter
 *
 */

const debug = require('debug')('adapter:ngsi-ld');

const _ = require('lodash');
const moment = require('moment-timezone');
const { v4: uuidv4 } = require('uuid');
const Constants = require('../lib/constants');
const URN_PREFIX = 'urn:ngsi-ld:';

/**
 * Determines if a value is of type float
 *
 * @param      {String}   value       Value to be analyzed
 * @return     {boolean}              True if float, False otherwise.
 */
function isFloat(value) {
    return !isNaN(value) && value.toString().indexOf('.') !== -1;
}

/**
 * Amends an NGSIv2 attribute to NGSI-LD format
 * All native JSON types are respected and cast as Property values
 * Relationships must be give the type relationship
 *
 * @param      {String}   attr       Attribute to be analyzed
 * @return     {Object}              an object containing the attribute in NGSI-LD
 *                                   format
 */

function formatAttribute(attr, transformFlags = {}) {
    // eslint eqeqeq - deliberate double equals to include undefined.
    if (attr.value == null || Number.isNaN(attr.value)) {
        return undefined;
    }
    let obj = { type: 'Property', value: attr.value };

    switch (attr.type.toLowerCase()) {
        // Properties
        case 'property':
        case 'string':
        case 'text':
        case 'textunrestricted':
            break;

        // Other Native JSON Types
        case 'boolean':
            obj.value = !!attr.value;
            break;
        case 'float':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else {
                obj.value = Number.parseFloat(attr.value);
            }
            break;
        case 'integer':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else {
                obj.value = Number.parseInt(attr.value);
            }
            break;
        case 'number':
            if (isNaN(attr.value)) {
                obj = undefined;
            } else if (isFloat(attr.value)) {
                obj.value = Number.parseFloat(attr.value);
            } else {
                obj.value = Number.parseInt(attr.value);
            }
            break;

        // Temporal Properties
        case 'datetime':
            obj.value = {
                '@type': 'DateTime',
                '@value': moment.tz(attr.value, 'Etc/UTC').toISOString()
            };
            break;
        case 'date':
            obj.value = {
                '@type': 'Date',
                '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.DATE)
            };
            break;
        case 'time':
            obj.value = {
                '@type': 'Time',
                '@value': moment.tz(attr.value, 'Etc/UTC').format(moment.HTML5_FMT.TIME_SECONDS)
            };
            break;

        // GeoProperties
        case 'geoproperty':
        case 'point':
        case 'geo:point':
        case 'geo:json':
        case 'linestring':
        case 'geo:linestring':
        case 'polygon':
        case 'geo:polygon':
        case 'multipoint':
        case 'geo:multipoint':
        case 'multilinestring':
        case 'geo:multilinestring':
        case 'multipolygon':
        case 'geo:multipolygon':
            obj.type = 'GeoProperty';
            obj.value = attr.value;
            break;

        // Relationships
        case 'relationship':
            obj.type = 'Relationship';
            obj.object = attr.value;
            delete obj.value;
            break;

        // LanguageProperties
        case 'languageproperty':
            obj.type = 'LanguageProperty';
            obj.languageMap = attr.value;
            delete obj.value;
            break;

        default:
            obj.value = { '@type': attr.type, '@value': attr.value };
            break;
    }

    if (attr.metadata) {
        let timestamp;
        Object.keys(attr.metadata).forEach(function (key) {
            switch (key) {
                case 'TimeInstant':
                    timestamp = attr.metadata[key].value;
                    if (timestamp === Constants.ATTRIBUTE_DEFAULT || !moment(timestamp).isValid()) {
                        obj.observedAt = Constants.DATETIME_DEFAULT;
                    } else {
                        obj.observedAt = moment.tz(timestamp, 'Etc/UTC').toISOString();
                    }

                    break;
                case 'unitCode':
                    obj.unitCode = attr.metadata[key].value;
                    break;
                default:
                    obj[key] = formatAttribute(attr.metadata[key]);
            }
        });
        delete obj.TimeInstant;
    }

    if (transformFlags.sysAttrs) {
        obj.modifiedAt = obj.observedAt || Constants.DATETIME_DEFAULT;
        obj.createdAt = Constants.DATETIME_DEFAULT;
    }
    if (transformFlags.concise) {
        delete obj.type;
        if (obj.value && _.isEmpty(attr.metadata) && !transformFlags.sysAttrs) {
            obj = obj.value;
        }
    }

    delete obj.metadata;
    return obj;
}

function formatType(type) {
    let ldType = 'Property';

    switch (type.toLowerCase()) {
        case 'geoproperty':
        case 'point':
        case 'geo:point':
        case 'geo:json':
        case 'linestring':
        case 'geo:linestring':
        case 'polygon':
        case 'geo:polygon':
        case 'multipoint':
        case 'geo:multipoint':
        case 'multilinestring':
        case 'geo:multilinestring':
        case 'multipolygon':
        case 'geo:multipolygon':
            ldType = 'GeoProperty';
            break;
        case 'listproperty':
            ldType = 'ListProperty';
            break;
        case 'relationship':
            ldType = 'Relationship';
            break;
        case 'listrelationship':
            ldType = 'ListRelationship';
            break;
        case 'languageproperty':
            ldType = 'LanguageProperty';
            break;
        case 'vocabularyproperty':
            ldType = 'VocabularyProperty';
            break;
        default:
            ldType = 'Property';
            break;
    }
    return ldType;
}

/**
 * Amends an NGSIv2 payload to NGSI-LD format
 *
 * @param      {Object}   value       JSON to be converted
 * @return     {Object}               NGSI-LD payload
 */

function formatEntity(json, isJSONLD, transformFlags = {}) {
    const obj = {};
    if (isJSONLD) {
        obj['@context'] = Constants.JSON_LD_CONTEXT;
    }

    let id;
    Object.keys(json).forEach(function (key) {
        switch (key) {
            case 'id':
                id = json[key];
                obj[key] = id;
                if (!id.startsWith(URN_PREFIX)) {
                    obj[key] = URN_PREFIX + json.type + ':' + id;
                    debug('Amending id to a valid URN: %s', obj[key]);
                }
                break;
            case 'type':
                obj[key] = json[key];
                break;
            case 'TimeInstant':
                // Timestamp should not be added as a root
                // element for NSGI-LD.
                break;
            default:
                obj[key] = formatAttribute(json[key], transformFlags);
        }
    });

    delete obj.TimeInstant;
    return obj;
}

function formatSubscription(json, isJSONLD) {
    const condition = json.subject.condition || {};
    const expression = condition.expression || {};
    const notification = json.notification || {};

    const obj = {
        id: URN_PREFIX + 'Subscription:' + json.id,
        type: 'Subscription',
        description: json.description,
        entities: json.subject.entities,
        watchedAttributes: condition.attrs,
        q: expression.q,
        notification: {
            attributes: notification.attrs,
            format: notification.attrsFormat,
            endpoint: {
                uri: notification.httpCustom.headers.target,
                accept: 'application/json'
            }
        }
    };

    return Constants.appendContext(obj, isJSONLD);
}

function formatEntityTypeList(json, isJSONLD) {
    const typeList = _.map(json, (type) => {
        return type.type;
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityTypeList:' + uuidv4(),
        type: 'EntityTypeList',
        typeList
    };

    return Constants.appendContext(obj, isJSONLD);
}

function formatEntityTypeInformation(json, isJSONLD, typeName) {
    const attributeDetails = [];

    _.forEach(json.attrs, (value, key) => {
        attributeDetails.push({
            id: key,
            type: 'Attribute',
            attributeName: key,
            attributeTypes: _.map(value.types, (type) => {
                return formatType(type);
            })
        });
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityTypeInformation:' + uuidv4(),
        type: 'EntityTypeInformation',
        typeName,
        entityCount: json.count,
        attributeDetails
    };

    return Constants.appendContext(obj, isJSONLD);
}

function formatEntityAttributeList(json, isJSONLD) {
    const attributeList = [];

    _.map(json, (type) => {
        _.forEach(type.attrs, (value, key) => {
            attributeList.push(key);
        });
    });

    const obj = {
        id: 'urn:ngsi-ld:EntityAttributeList:' + uuidv4(),
        type: 'EntityAttributeList',
        attributeList: _.uniq(attributeList)
    };

    return Constants.appendContext(obj, isJSONLD);
}

function formatEntityAttribute(json, isJSONLD, attributeName) {
    let attributeCount = 0;
    let attributeTypes = [];
    const typeNames = [];

    const filtered = _.filter(json, function (o) {
        return o.attrs[attributeName];
    });

    _.map(filtered, (type) => {
        attributeCount += type.count;
        typeNames.push(type.type);
        attributeTypes.push(type.attrs[attributeName].types);
    });

    attributeTypes = _.uniq(_.flatten(attributeTypes));

    const obj = {
        id: attributeName,
        type: 'Attribute',
        attributeCount,
        attributeTypes: _.map(attributeTypes, (type) => {
            return formatType(type);
        }),
        typeNames,
        attributeName
    };

    return Constants.appendContext(obj, isJSONLD);
}

exports.formatAttribute = formatAttribute;
exports.formatEntity = formatEntity;
exports.formatSubscription = formatSubscription;
exports.formatEntityTypeList = formatEntityTypeList;
exports.formatEntityTypeInformation = formatEntityTypeInformation;
exports.formatEntityAttributeList = formatEntityAttributeList;
exports.formatEntityAttribute = formatEntityAttribute;
