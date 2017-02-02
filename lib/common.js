/**
 * @file Common utilities module
 * @module common
**/
define(function(require, exports, module) {
    'use strict';

    var _ = require('lodash');

    function isNumberLike(value) {
        return _.compose(_.complement(Boolean), isNaN, parseFloat) && isFinite(value);
    }

    var common = Object.create(null);
    var PLACES_HUNDRED = 3;
    /**
     * @method isNumberLike
     * @description **Returns** true if val is number-like
     * @memberof module:common
     * @param {*} [val]
     * @example
     * isNumberLike(3);     // true
     * isNumberLike('42');  // true
     * isNumberLike('foo'); // false
     * @returns {boolean}
    **/
    common.isNumberLike = isNumberLike;
    /**
     * @method addLeadingZeroes
     * @memberof module:common
     * @param {(string|number)} value
     * @param {number} [places=3] The total final length of the formatted DataValue
     * @returns {?string} Returns null for 'non-number-like' inputs
     * @example
     * addLeadingZeroes(7);    // '007'
     * addLeadingZeroes(7, 5); // '00007'
    **/
    common.addLeadingZeroes = function(value, places) {
        value = Number(value);
        if (isNaN(value)) {
            return null;
        }
        places = places ? places : PLACES_HUNDRED;
        var numberOfChars = _.compose(String, Math.floor, Math.abs)(value).length;
        var numberOfZeroes = numberOfChars < places ? places - numberOfChars : 0;
        var stringOfZeroes = _.range(0, numberOfZeroes).map(function() {return '0';}).join('');
        return (value < 0 ? '-' : '') + stringOfZeroes + Math.abs(value);
    };
    module.exports = common;
});
