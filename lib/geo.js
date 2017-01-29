/**
 * @file Geodesic, cartographic, and geographic algorithms
 * @author Jason Wohlgemuth
**/
define(function(require, exports, module) {
    'use strict';

    var _ = require('lodash');
    // var _ = require('underscore');
    // var _ = require('ramda');

    // Utility library shim (Underscore, Lodash, or Ramda)
    if (typeof (_.flow) !== 'function') {
        if (typeof (_.mixin) === 'function') {// Underscore
            _.mixin({
                complement: _.negate
            });
        } else {// Ramda
            _.constant = _.always;
        }
    } else {// Lodash
        _.any = _.some;
        _.complement = _.negate;
        _.compose = _.flowRight;
    }

    var PLACES_HUNDRED = 3;
    var TEN_THOUSANDTHS = 4;
    var MINUTES_PER_DEGREE = 60;
    var SECONDS_PER_MINUTE = 60;
    var SECONDS_PER_DEGREE = MINUTES_PER_DEGREE * SECONDS_PER_MINUTE;
    var RADIANS_PER_DEGREE = Math.PI / 180.0;
    var DEGREES_PER_RADIAN = 180.0 / Math.PI;
    var GEOSPATIAL_VALUE_LENGTH = 3;

    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
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
        };
    }
    Math.sign = Math.sign || function(x) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
    Math.trunc = Math.trunc || function(x) {
        return Math.sign(x) * _.compose(Math.floor, Math.abs)(x);
    };

    function frac(float) {
        float = Math.abs(float);
        var digits = (float !== Math.trunc(float)) ? String(float).split('.')[1].length : 0;
        return (float - Math.trunc(float)).toFixed(digits);
    }
    function clone(obj) {return JSON.parse(JSON.stringify(obj));}
    function extend(a, b) {Object.keys(b).forEach(function(key) {a[key] = b[key];});return a;}
    function multiply(a, b) {return a * b;}
    function isNumberLike(value) {return _.compose(_.complement(Boolean), isNaN, parseFloat) && isFinite(value);}
    function isString(value) {return typeof (value) === 'string';}

    var rad = _.partial(multiply, [RADIANS_PER_DEGREE]);
    var deg = _.partial(multiply, [DEGREES_PER_RADIAN]);

    var geolib = {};
    var Convert = Object.create(null);
    geolib.convert = {};
    geolib.GEOSPATIAL_FORMATS = {};
    geolib.DATUM = {};
    /**
     * @namespace Geospatial Formats
     * @property {string} DEGREES_MINUTES_SECONDS=DegreesMinuteSeconds
     * @property {string} DEGREES_DECIMAL_MINUTES=DegreesDecimalMinutes
     * @property {string} DECIMAL_DEGREES=DecimalDegrees
     * @property {string} RADIAN_DEGREES=RadianDegrees Under Construction
     * @property {string} CARTESIAN=Cartesian Under Construction
    **/
    var GEOSPATIAL_FORMATS = Object.create(null, {
        CARTESIAN:               {enumerable: true, value: 'Cartesian'},
        DEGREES_MINUTES_SECONDS: {enumerable: true, value: 'DegreesMinuteSeconds'},
        DEGREES_DECIMAL_MINUTES: {enumerable: true, value: 'DegreesDecimalMinutes'},
        DECIMAL_DEGREES:         {enumerable: true, value: 'DecimalDegrees'},
        RADIAN_DEGREES:          {enumerable: true, value: 'RadianDegrees'}
    });
    /**
     * @namespace WGS84 Datum
     * @description World Geodetic System 1984 (WGS84) is an Earth-centered, Earth-fixed (ECEF) global datum
     * @property {number} SEMI_MAJOR_AXIS=6378137.0 a
     * @property {number} SEMI_MINOR_AXIS=6356752.3142 a(1-f)
     * @property {number} FLATTENING=0.0033528106718309896 f
     * @property {number} FLATTENING_INVERSE=298.257223563 1/f
     * @property {number} FIRST_ECCENTRICITY_SQUARED=0.006694380004260827 e^2
     * @property {number} LINEAR_ECCENTRICITY=521854.00842339 sqrt(a^2 - b^2)
     * @property {number} AXIS_RATIO=0.996647189335 b/a
     * @see [DoD World Geodetic System 1984]{@link http://earth-info.nga.mil/GandG/publications/tr8350.2/tr8350_2.html}
    **/
    var WGS84 = Object.create(null, {
        SEMI_MAJOR_AXIS:            {enumerable: true, value: 6378137.0},
        SEMI_MINOR_AXIS:            {enumerable: true, value: 6356752.3142},
        FLATTENING:                 {enumerable: true, value: 0.0033528106718309896},
        FLATTENING_INVERSE:         {enumerable: true, value: 298.257223563},
        FIRST_ECCENTRICITY_SQUARED: {enumerable: true, value: 0.006694380004260827},
        LINEAR_ECCENTRICITY:        {enumerable: true, value: 521854.00842339},
        AXIS_RATIO:                 {enumerable: true, value: 0.996647189335}
    });
    /**
     * @method isNumberLike
     * @description **Returns** true if val is number-like
     * @param {*} [val]
     * @example
     * isNumberLike(3);     // true
     * isNumberLike('46');  // true
     * isNumberLike('foo'); // false
     * @returns {boolean}
    **/
    geolib.isNumberLike = isNumberLike;
    /**
     * @method addLeadingZeroes
     * @param {(string|number)} value
     * @param {number} [places=3] The total final length of the formatted DataValue
     * @returns {?string} Returns null for 'non-number-like' inputs
     * @example
     * geolib.addLeadingZeroes(7);    // '007'
     * geolib.addLeadingZeroes(7, 5); // '00007'
    **/
    geolib.addLeadingZeroes = function(value, places) {
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
    /**
     * @private
     * @function toCartesian
     * @description Convert geodetic (latitude, longitude, height) to  cartesian (x, y, z)
     * @property {number} latitude
     * @property {number} longitude
     * @property {number} height
     * @property {object} [datum=WGS84]
     * @returns {array}
    **/
    Convert.toCartesian = function(latitude, longitude, height, datum) {
        datum = datum ? datum : WGS84;
        var h = height ? height : 0;
        var lat = rad(latitude);
        var lon = rad(longitude);
        var COS_LON = Math.cos(lon);
        var COS_LAT = Math.cos(lat);
        var SIN_LON = Math.sin(lon);
        var SIN_LAT = Math.sin(lat);
        var SIN_LAT_SQUARED = SIN_LAT * SIN_LAT;
        var N = datum.SEMI_MAJOR_AXIS / Math.sqrt(1 - datum.FIRST_ECCENTRICITY_SQUARED * SIN_LAT_SQUARED);
        var x = (N + h) * COS_LAT * COS_LON;
        var y = (N + h) * COS_LAT * SIN_LON;
        var z = ((1 - datum.FIRST_ECCENTRICITY_SQUARED) * N + h) * SIN_LAT;
        return [x, y, z];
    };
    /**
     * @private
     * @function toGeodetic
     * @description Convert cartesian (x, y, z) to geodetic (latitude, longitude, height)
     * @property {number} x
     * @property {number} y
     * @property {number} z
     * @property {object} [datum=WGS84]
     * @returns {array}
     * @see [Cartesian to Geodetic Coordinates without Iterations]{@link http://dx.doi.org/10.1061/(ASCE)0733-9453(2000)126:1(1)}
    **/
    Convert.toGeodetic = function(x, y, z, datum) {
        datum = datum ? datum : WGS84;
        var squared = function(n) {return n * n;};
        var a = datum.SEMI_MAJOR_AXIS;
        var b = datum.SEMI_MINOR_AXIS;
        var E = datum.LINEAR_ECCENTRICITY;
        var X_SQUARED = squared(x);
        var Y_SQUARED = squared(y);
        var Z_SQUARED = squared(z);
        var Q = Math.sqrt(X_SQUARED + Y_SQUARED);
        var R = Math.sqrt(X_SQUARED + Y_SQUARED + Z_SQUARED);
        var E_SQUARED = squared(E);
        var R_SQUARED = squared(R);
        var R_SQUARED_MINUS_E_SQUARED = R_SQUARED - E_SQUARED;
        var u = Math.sqrt(
            (1 / 2) * (R_SQUARED_MINUS_E_SQUARED + Math.sqrt(squared(R_SQUARED_MINUS_E_SQUARED) + (4 * E_SQUARED * Z_SQUARED)))
        );
        var TAN_REDUCED_LATITUDE = (Math.sqrt(squared(u) + E_SQUARED) * z) / (u * Q);
        var REDUCED_LATITUDE = Math.atan(TAN_REDUCED_LATITUDE);
        var COS_REDUCED_LATITUDE = Math.cos(REDUCED_LATITUDE);
        var SIN_REDUCED_LATITUDE = Math.sin(REDUCED_LATITUDE);
        var latitude = Math.atan((a / b) * TAN_REDUCED_LATITUDE);
        var longitude = Math.atan2(y, x);
        var height = Math.sqrt(
            squared(z - b * SIN_REDUCED_LATITUDE) + squared(Q - a * COS_REDUCED_LATITUDE)
        );
        return [deg(latitude), deg(longitude), Number(height.toFixed(1))];
    };
    /**
     * @private
     * @function toDegreesMinutesSeconds
     * @param {number[]} value Latitude or longitude expressed as [DDD, MMM, SSS]
     * @returns {number[]} [degrees, minutes, seconds]
     * @example
     * geolib.convert.toDegreesMinutesSeconds([32.8303, 0, 0]); // [32, 49, 49.0800]
     * geolib.convert.toDegreesMinutesSeconds([32, 49.818, 0]); // [32, 49, 49.0800]
    **/
    Convert.toDegreesMinutesSeconds = function(value) {
        if (!(Array.isArray(value) && value.length === GEOSPATIAL_VALUE_LENGTH)) {
            return null;
        }
        var data = value;
        var dimension = data.length - clone(data).reverse().findIndex(function(val) {return Math.abs(val) > 0;});
        var degrees = Math.trunc(value[0]);
        var minutes = 0;
        var seconds = 0;
        if (dimension === 1) {
            minutes = frac(data[0]) * MINUTES_PER_DEGREE;
            seconds = frac(minutes) * SECONDS_PER_MINUTE;
        } else if (dimension === 2) {
            minutes = Math.trunc(data[1]);
            seconds = frac(data[1]) * SECONDS_PER_MINUTE;
        } else if (dimension === GEOSPATIAL_VALUE_LENGTH) {
            minutes = value[1];
            seconds = value[2];
        }
        return [
            degrees,
            Math.trunc(minutes),
            seconds.toFixed(TEN_THOUSANDTHS)
        ].map(Number);
    };
    /**
     * @private
     * @function toDegreesDecimalMinutes
     * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
     * @returns {number[]} [degrees, minutes, seconds]
     * @example
     * geolib.convert.toDegreesDecimalMinutes([32.8303, 0, 0]);   // [32, 49.818]
     * geolib.convert.toDegreesDecimalMinutes([32, 49, 49.0800]); // [32, 49.818]
    **/
    Convert.toDegreesDecimalMinutes = function(value) {
        if (!(Array.isArray(value) && value.length === GEOSPATIAL_VALUE_LENGTH)) {
            return null;
        }
        var data = value;
        var dimension = data.length - clone(data).reverse().findIndex(function(val) {return Math.abs(val) > 0;});
        var degrees = Math.trunc(data[0]);
        var minutes = 0;
        var seconds = 0;
        if (dimension === 1) {
            minutes = frac(data[0]) * MINUTES_PER_DEGREE;
        } else if (dimension > 1) {
            minutes = data[1] + (data[2] / SECONDS_PER_MINUTE);
        }
        return [
            degrees,
            minutes.toFixed(TEN_THOUSANDTHS),
            seconds
        ].map(Number);
    };
    /**
     * @private
     * @function toDecimalDegrees
     * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
     * @returns {number}
     * @example
     * geolib.convert.toDecimalDegrees(['32', '49', '49.0800']) // 32.8303
    **/
    Convert.toDecimalDegrees = function(value) {
        var sign;
        var data = value;
        if (isString(data)) {
            data = data.split(' ');
        }
        if (Array.isArray(data)) {
            sign = Math.sign(data[0]);
            data = data.map(Number).map(Math.abs);
            data = sign * (data[0] + (data[1] / MINUTES_PER_DEGREE) + (data[2] / SECONDS_PER_DEGREE));
            return !isNaN(data) ? data : null;
        } else {
            return null;
        }
    };

    extend(geolib.convert, Convert);
    extend(geolib.GEOSPATIAL_FORMATS, GEOSPATIAL_FORMATS);
    extend(geolib.DATUM, WGS84);
    Object.freeze(geolib.convert);
    Object.freeze(geolib.GEOSPATIAL_FORMATS);
    Object.freeze(geolib.DATUM);

    module.exports = geolib;
});
