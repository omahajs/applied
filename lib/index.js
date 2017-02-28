/* istanbul ignore next */
define(function(require, exports, module) {
    'use strict';

    require('./polyfill');
    var _          = require('lodash');
    var math       = require('./math');
    var common     = require('./common');
    var geodetic   = require('./geodetic');
    var atmosphere = require('./atmosphere');

    module.exports = {
        math: math,
        common: common,
        geodetic: geodetic,
        atmosphere: atmosphere
    };
});
