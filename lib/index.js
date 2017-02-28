/* istanbul ignore next */
define(function(require, exports, module) {
    'use strict';

    require('./polyfill');
    var math       = require('./math');
    var geodetic   = require('./geodetic');
    var atmosphere = require('./atmosphere');

    module.exports = {
        math: math,
        geodetic: geodetic,
        atmosphere: atmosphere
    };
});
