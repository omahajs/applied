/**
 * @file Geodesic, cartographic, and geographic algorithms
 * @author Jason Wohlgemuth
 * @module geodetic
**/
define(function(require, exports, module) {
    'use strict';

    var _ = require('lodash');
    // var _ = require('underscore');

    var TEN_THOUSANDTHS = 4;
    var MINUTES_PER_DEGREE = 60;
    var SECONDS_PER_MINUTE = 60;
    var SECONDS_PER_DEGREE = MINUTES_PER_DEGREE * SECONDS_PER_MINUTE;
    var RADIANS_PER_DEGREE = Math.PI / 180.0;
    var DEGREES_PER_RADIAN = 180.0 / Math.PI;
    var GEOSPATIAL_VALUE_LENGTH = 3;

    function frac(float) {
        float = Math.abs(float);
        var digits = (float !== Math.trunc(float)) ? String(float).split('.')[1].length : 0;
        return (float - Math.trunc(float)).toFixed(digits);
    }
    function clone(obj) {return JSON.parse(JSON.stringify(obj));}
    function multiply(a, b) {return a * b;}
    function squared(n) {return n * n;}
    function getArguments() {return Array.prototype.slice.apply(arguments);}
    function padArrayWithZeroes(n, arr) {return arr.concat(_.times(n - arr.length, _.constant(0)));}
    function onlyAllowNumbers(arr) {return arr.every(_.isNumber) ? arr : [];}
    function processInputs(fn) {
        var processingSteps = [
            getArguments,
            _.flatten,
            _.curry(padArrayWithZeroes)(3),
            onlyAllowNumbers
        ];
        return _.flow(processingSteps, fn);
    }

    var rad = _.partial(multiply, [RADIANS_PER_DEGREE]);
    var deg = _.partial(multiply, [DEGREES_PER_RADIAN]);

    /**
     * @namespace Geospatial Formats
     * @property {string} DEGREES_MINUTES_SECONDS=DegreesMinuteSeconds
     * @property {string} DEGREES_DECIMAL_MINUTES=DegreesDecimalMinutes
     * @property {string} DECIMAL_DEGREES=DecimalDegrees
     * @property {string} RADIAN_DEGREES=RadianDegrees
     * @property {string} CARTESIAN=Cartesian
    **/
    var FORMATS = Object.create(null, {
        CARTESIAN:               {enumerable: true, value: 'Cartesian'},
        DEGREES_MINUTES_SECONDS: {enumerable: true, value: 'DegreesMinuteSeconds'},
        DEGREES_DECIMAL_MINUTES: {enumerable: true, value: 'DegreesDecimalMinutes'},
        DECIMAL_DEGREES:         {enumerable: true, value: 'DecimalDegrees'},
        RADIAN_DEGREES:          {enumerable: true, value: 'RadianDegrees'}
    });
    Object.freeze(FORMATS);
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
    var DATUM = Object.create(null, {
        EARTH_EQUATOR_RADIUS:       {enumerable: true, value: 6378137},
        EARTH_MEAN_RADIUS:          {enumerable: true, value: 6371001},
        SEMI_MAJOR_AXIS:            {enumerable: true, value: 6378137.0},
        SEMI_MINOR_AXIS:            {enumerable: true, value: 6356752.3142},
        FLATTENING:                 {enumerable: true, value: 0.0033528106718309896},
        FLATTENING_INVERSE:         {enumerable: true, value: 298.257223563},
        FIRST_ECCENTRICITY_SQUARED: {enumerable: true, value: 0.006694380004260827},
        LINEAR_ECCENTRICITY:        {enumerable: true, value: 521854.00842339},
        AXIS_RATIO:                 {enumerable: true, value: 0.996647189335}
    });
    Object.freeze(DATUM);
    //
    // API
    //
    var calculate = {
        radius: getRadius,
        distance: function() {/* haversine implementation */}
    };
    var convert = {
        cartesianToGeodetic:     processInputs(convertCartesianToGeodetic),
        geodeticToCartesian:     processInputs(convertGeodeticToCartesian),
        toDecimalDegrees:        processInputs(convertToDecimalDegrees),
        toDegreesDecimalMinutes: processInputs(convertToDegreesDecimalMinutes),
        toDegreesMinutesSeconds: processInputs(convertToDegreesMinutesSeconds)
    };
    module.exports = {
        DATUM: DATUM,
        FORMATS: FORMATS,
        convert: convert,
        calculate: calculate
    };
    //
    // Functions
    //
    /**
     * @function getGeocentricLatitude
     * @param {number} theta Geographic latitude
     * @returns {number} Geocentric latitude
    **/
    function getGeocentricLatitude(theta) {
        var coefficient = squared(1 - DATUM.FLATTENING);
        return coefficient * Math.tan(rad(theta));
    }
    /**
     * @function getRadius
     * @description Get radius at a given latitude using WGS84 datum
     * @param {number} [theta] Geographic latitude (decimal format)
     * @returns {number} Radius in meters
     * @example <caption>Radius at equator</caption>
     * var geodetic = require('applied').geodetic;
     * geodetic.calculate.radius(0);// 6378137
     * @example <caption>Radius at the Northern Tropic (Tropic of Cancer)</caption>
     * var geodetic = require('applied').geodetic;
     * var convert = geodetic.convert;
     * var calculate = geodetic.calculate;
     * var NORTHERN_TROPIC_LATITUDE = [23, 26, 13.4];
     * var latitude = convert.toDecimalDegrees(NORTHERN_TROPIC_LATITUDE);
     * calculate.radius(latitude);// 6374410.938026696
     * @example <caption>Radius with not latitude input</caption>
     * var geodetic = require('applied').geodetic;
     * geodetic.calculate.radius();// 6371001
    **/
    function getRadius(theta) {
        var radius;
        if (_.isNil(theta)) {
            radius = DATUM.EARTH_MEAN_RADIUS;
        } else {
            var SIN_THETA = Math.sin(getGeocentricLatitude(theta));
            radius = DATUM.SEMI_MAJOR_AXIS * (1 - (DATUM.FLATTENING * squared(SIN_THETA)));
        }
        return radius;
    }
    /**
     * @function convertGeodeticToCartesian
     * @description Convert geodetic (latitude, longitude, height) to  cartesian (x, y, z)
     * @memberof module:geodetic
     * @property {number[]} point [latitude, longitude, height] (in degrees)
     * @returns {number[]} [x, y, z]
    **/
    function convertGeodeticToCartesian(point) {
        var latitude = point[0];
        var longitude = point[1];
        var height = point[2];
        var h = height ? height : 0;
        var lat = rad(latitude);
        var lon = rad(longitude);
        var COS_LON = Math.cos(lon);
        var COS_LAT = Math.cos(lat);
        var SIN_LON = Math.sin(lon);
        var SIN_LAT = Math.sin(lat);
        var SIN_LAT_SQUARED = SIN_LAT * SIN_LAT;
        var N = DATUM.SEMI_MAJOR_AXIS / Math.sqrt(1 - DATUM.FIRST_ECCENTRICITY_SQUARED * SIN_LAT_SQUARED);
        var x = (N + h) * COS_LAT * COS_LON;
        var y = (N + h) * COS_LAT * SIN_LON;
        var z = ((1 - DATUM.FIRST_ECCENTRICITY_SQUARED) * N + h) * SIN_LAT;
        return [x, y, z];
    }
    /**
     * @function convertCartesianToGeodetic
     * @description Convert cartesian (x, y, z) to geodetic (latitude, longitude, height)
     * @memberof module:geodetic
     * @property {number[]} point [x, y, z]
     * @returns {number[]} [latitude, longitude, height] (in degrees)
     * @see [Cartesian to Geodetic Coordinates without Iterations]{@link http://dx.doi.org/10.1061/(ASCE)0733-9453(2000)126:1(1)}
    **/
    function convertCartesianToGeodetic(point) {
        var a = DATUM.SEMI_MAJOR_AXIS;
        var b = DATUM.SEMI_MINOR_AXIS;
        var E = DATUM.LINEAR_ECCENTRICITY;
        var x = point[0];
        var y = point[1];
        var z = point[2];
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
    }
    /**
     * @function convertToDegreesMinutesSeconds
     * @memberof module:geodetic
     * @param {number[]} value Latitude or longitude expressed as [DDD, MMM, SSS]
     * @returns {number[]} [degrees, minutes, seconds]
     * @example <caption>Convert a decimal degree value</caption>
     * var convert = require('applied').geodetic.convert;
     * var val = [32.8303, 0, 0];
     * convert.toDegreesMinutesSeconds(val);// [32, 49, 49.0800]
     * @example <caption>Convert a decimal degree minutes value</caption>
     * var convert = require('applied').geodetic.convert;
     * var val = [32, 49.818, 0];
     * convert.toDegreesMinutesSeconds(val);// [32, 49, 49.0800]
    **/
    function convertToDegreesMinutesSeconds(value) {
        if (value.length !== GEOSPATIAL_VALUE_LENGTH) {
            return null;
        }
        var data = value;
        var dimension = data.length - data.slice(0).reverse().findIndex(function(val) {return Math.abs(val) > 0;});
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
    }
    /**
     * @function convertToDegreesDecimalMinutes
     * @memberof module:geodetic
     * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
     * @returns {number[]} [degrees, minutes, seconds]
     * @example <caption>Convert a decimal degree value</caption>
     * var geodetic = require('applied').geodetic;
     * var val = [32.8303, 0, 0];
     * geodetic.convert.toDegreesDecimalMinutes(val);// [32, 49.818]
     * @example <caption>Convert a degree minutes seconds value</caption>
     * var convert = require('applied').geodetic.convert;
     * var val = [32, 49, 49.0800];
     * convert.toDegreesDecimalMinutes(val);// [32, 49.818]
    **/
    function convertToDegreesDecimalMinutes(value) {
        if (value.length !== GEOSPATIAL_VALUE_LENGTH) {
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
    }
    /**
     * @function convertToDecimalDegrees
     * @memberof module:geodetic
     * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
     * @returns {number}
     * @example <caption>Convert a degree minutes seconds value</caption>
     * var convert = require('applied').geodetic.convert;
     * var val = ['32', '49', '49.0800'];
     * convert.toDecimalDegrees(val);// 32.8303
    **/
    function convertToDecimalDegrees(value) {
        var sign;
        var data = value;
        sign = Math.sign(data[0]);
        data = data.map(Number).map(Math.abs);
        data = sign * (data[0] + (data[1] / MINUTES_PER_DEGREE) + (data[2] / SECONDS_PER_DEGREE));
        return !isNaN(data) ? data : null;
    }
});
