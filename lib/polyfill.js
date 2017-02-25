/* istanbul ignore next */
/**
 * @file Collection of polyfills
 * @author Jason Wohlgemuth
 * @module polyfill
**/
define(function() {
    'use strict';

    Math.sign = Math.sign || sign;
    Math.trunc = Math.trunc || trunc;
    Array.prototype.findIndex = Array.prototype.findIndex || findIndex;

    function sign(x) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    }
    function trunc(x) {
        return sign(x) * Math.floor(Math.abs(x));
    }
    function findIndex(predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    }
});
