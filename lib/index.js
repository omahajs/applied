define(function(require, exports) {
    'use strict';

    var _ = require('lodash');
    // var _ = require('underscore');

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
    //
    // Polyfills
    //
    // Math.sign = Math.sign || function(x) {
    //     x = +x;
    //     if (x === 0 || isNaN(x)) {
    //         return x;
    //     }
    //     return x > 0 ? 1 : -1;
    // };
    // Math.trunc = Math.trunc || function(x) {
    //     return Math.sign(x) * _.compose(Math.floor, Math.abs)(x);
    // };
    // if (!Array.prototype.findIndex) {
    //     Array.prototype.findIndex = function(predicate) {
    //         if (this === null) {
    //             throw new TypeError('Array.prototype.findIndex called on null or undefined');
    //         }
    //         if (typeof predicate !== 'function') {
    //             throw new TypeError('predicate must be a function');
    //         }
    //         var list = Object(this);
    //         var length = list.length;
    //         var thisArg = arguments[1];
    //         var value;
    //         for (var i = 0; i < length; i++) {
    //             value = list[i];
    //             if (predicate.call(thisArg, value, i, list)) {
    //                 return i;
    //             }
    //         }
    //         return -1;
    //     };
    // }

    exports.common = require('./common');
    exports.geodetic = require('./geodetic');
});
