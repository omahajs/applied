/* istanbul ignore next */
define(function(require, exports, module) {
    'use strict';

    require('./polyfill');
    var _        = require('lodash');
    // var _     = require('underscore');
    var math     = require('./math');
    var common   = require('./common');
    var geodetic = require('./geodetic');
    //
    // Utility library shim (Underscore or Lodash)
    //
    if (typeof (_.flow) !== 'function') {
        if (typeof (_.mixin) === 'function') {// Underscore
            _.mixin({
                complement: _.negate
            });
        }
    } else {// Lodash
        _.any = _.some;
        _.complement = _.negate;
        _.compose = _.flowRight;
    }

    module.exports = {
        math: math,
        common: common,
        geodetic: geodetic
    };
});
