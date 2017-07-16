/* istanbul ignore next */
    'use strict';

require('./polyfill');
var math       = require('./math');
var geodetic   = require('./geodetic');
var atmosphere = require('./atmosphere');

module.exports = {
    math,
    geodetic: geodetic,
    atmosphere: atmosphere
};
