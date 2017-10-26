/**
 * @file Geodesic, cartographic, and geographic
 * @author Jason Wohlgemuth
 * @module geodetic
 * @prop {object} convert
 * @prop {function} convert.cartesianToGeodetic
 * @prop {function} convert.geodeticToCartesian
 * @prop {function} convert.toDecimalDegrees
 * @prop {function} convert.toDegreesDecimalMinutes
 * @prop {function} convert.toDegreesMinutesSeconds
 * @prop {object} calculate
 * @prop {function} calculate.radius
 * [Calculate the radius of the earth]{@link module:geodetic~getRadius}
 * @prop {function} calculate.distance
 * [Calculate distance between two points on the earth]{@link module:geodetic~calculateHaversineDistance}
**/
'use strict';

const flatten  = require('lodash/flatten');
const curry    = require('lodash/curry');
const times    = require('lodash/times');
const constant = require('lodash/constant');
const isNumber = require('lodash/isNumber');
const flow     = require('lodash/flow');
const isNil    = require('lodash/isNil');
const {deg, rad, hav} = require('./math');
const {abs, asin, atan, atan2, cos, sin, sqrt, tan, trunc} = Math;

const TEN_THOUSANDTHS = 4;
const MINUTES_PER_DEGREE = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DEGREE = MINUTES_PER_DEGREE * SECONDS_PER_MINUTE;
const GEOSPATIAL_VALUE_LENGTH = 3;

function frac(float) {
    float = abs(float);
    let digits = (float !== trunc(float)) ? String(float).split('.')[1].length : 0;
    return (float - trunc(float)).toFixed(digits);
}
function clone(obj) {return JSON.parse(JSON.stringify(obj));}
function squared(n) {return n * n;}
function getArguments() {return Array.prototype.slice.apply(arguments);}
function padArrayWithZeroes(n, arr) {return arr.concat(times(n - arr.length, constant(0)));}
function onlyAllowNumbers(arr) {return arr.every(isNumber) ? arr : [];}
function processInputs(fn) {
    let processingSteps = [
        getArguments,
        flatten,
        curry(padArrayWithZeroes)(3),
        onlyAllowNumbers
    ];
    return flow(processingSteps, fn);
}

/**
 * @namespace Geospatial Formats
 * @property {string} DEGREES_MINUTES_SECONDS=DegreesMinuteSeconds
 * @property {string} DEGREES_DECIMAL_MINUTES=DegreesDecimalMinutes
 * @property {string} DECIMAL_DEGREES=DecimalDegrees
 * @property {string} RADIAN_DEGREES=RadianDegrees
 * @property {string} CARTESIAN=Cartesian
**/
const FORMATS = Object.create(null, {
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
 * @property {number} EARTH_AUTHALIC_RADIUS Radius of a hypothetical perfect sphere that has the same surface area as the reference ellipsoid
 * @property {number} SEMI_MAJOR_AXIS=6378137.0 a
 * @property {number} SEMI_MINOR_AXIS=6356752.3142 a(1-f)
 * @property {number} FLATTENING=0.0033528106718309896 f
 * @property {number} FLATTENING_INVERSE=298.257223563 1/f
 * @property {number} FIRST_ECCENTRICITY_SQUARED=0.006694380004260827 e^2
 * @property {number} LINEAR_ECCENTRICITY=521854.00842339 sqrt(a^2 - b^2)
 * @property {number} AXIS_RATIO=0.996647189335 b/a
 * @see [DoD World Geodetic System 1984]{@link http://earth-info.nga.mil/GandG/publications/tr8350.2/tr8350_2.html}
**/
const DATUM = Object.create(null, {
    EARTH_EQUATOR_RADIUS:       {enumerable: true, value: 6378137},
    EARTH_MEAN_RADIUS:          {enumerable: true, value: 6371001},
    EARTH_AUTHALIC_RADIUS:      {enumerable: true, value: 6371007},
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
let convert = {
    cartesianToGeodetic:     processInputs(cartesianToGeodetic),
    geodeticToCartesian:     processInputs(geodeticToCartesian),
    toDecimalDegrees:        processInputs(toDecimalDegrees),
    toDegreesDecimalMinutes: processInputs(toDegreesDecimalMinutes),
    toDegreesMinutesSeconds: processInputs(toDegreesMinutesSeconds)
};
let calculate = {
    radius: getRadius,
    distance: calculateHaversineDistance
};
module.exports = {
    DATUM,
    FORMATS,
    convert,
    calculate
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
    let coefficient = squared(1 - DATUM.FLATTENING);
    return coefficient * tan(rad(theta));
}
/**
 * @function getRadius
 * @description Get radius at a given latitude using WGS84 datum
 * @param {number} [theta] Geographic latitude (decimal format)
 * @returns {number} Radius in meters
 * @example <caption>Radius at equator</caption>
 * const {geodetic} = require('applied');
 * let r = geodetic.calculate.radius(0);
 * console.log(r);// 6378137
 * @example <caption>Radius at the Northern Tropic (Tropic of Cancer)</caption>
 * const {geodetic} = require('applied');
 * const NORTHERN_TROPIC_LATITUDE = [23, 26, 13.4];
 * let latitude = geodetic.convert.toDecimalDegrees(NORTHERN_TROPIC_LATITUDE);
 * let r = geodetic.calculate.radius(latitude);
 * console.log(r);// 6374410.938026696
 * @example <caption>Radius with no latitude input (returns authalic radius)</caption>
 * const {geodetic} = require('applied');
 * let r = geodetic.calculate.radius();
 * console.log(r);// 6371001
 *
**/
function getRadius(theta) {
    let radius;
    if (isNil(theta)) {
        radius = DATUM.EARTH_MEAN_RADIUS;
    } else {
        let SIN_THETA = sin(getGeocentricLatitude(theta));
        radius = DATUM.SEMI_MAJOR_AXIS * (1 - (DATUM.FLATTENING * squared(SIN_THETA)));
    }
    return radius;
}
/**
 * @function calculateHaversineDistance
 * @param {number[]} pointA [latitude, longitude] (in degrees)
 * @param {number[]} pointB [latitude, longitude] (in degrees)
 * @returns {number} Distance between points (in meters)
 * @example <caption>Calulate distance from Omaha, NE to San Diego, CA</caption>
 * const {geodetic} = require('applied');
 * const a = [41.2500, 96.0000];// Omaha, NE
 * const b = [32.7157, 117.1611];// San Diego, CA
 * let distance = geodetic.calculate.distance(a, b);
 * console.log(distance);// about 2098 km
**/
function calculateHaversineDistance(pointA, pointB) {
    let a = pointA.map(rad);
    let b = pointB.map(rad);
    let Δ = [
        b[0] - a[0], // latitude
        b[1] - a[1] // longitude
    ];
    const R = DATUM.EARTH_AUTHALIC_RADIUS;
    let inner = hav(Δ[0]) + (cos(a[0]) * cos(b[0]) * hav(Δ[1]));
    return 2 * R * asin(sqrt(inner));
}
/**
 * @function geodeticToCartesian
 * @description Convert geodetic (latitude, longitude, height) to  cartesian (x, y, z)
 * @memberof module:geodetic
 * @property {number[]} point [latitude, longitude, height] (in degrees)
 * @returns {number[]} [x, y, z]
**/
function geodeticToCartesian(point) {
    let [latitude, longitude, height] = point;
    let h = height ? height : 0;
    let lat = rad(latitude);
    let lon = rad(longitude);
    const COS_LON = cos(lon);
    const COS_LAT = cos(lat);
    const SIN_LON = sin(lon);
    const SIN_LAT = sin(lat);
    const SIN_LAT_SQUARED = SIN_LAT * SIN_LAT;
    const N = DATUM.SEMI_MAJOR_AXIS / sqrt(1 - DATUM.FIRST_ECCENTRICITY_SQUARED * SIN_LAT_SQUARED);
    let x = (N + h) * COS_LAT * COS_LON;
    let y = (N + h) * COS_LAT * SIN_LON;
    let z = ((1 - DATUM.FIRST_ECCENTRICITY_SQUARED) * N + h) * SIN_LAT;
    return [x, y, z];
}
/**
 * @function cartesianToGeodetic
 * @description Convert cartesian (x, y, z) to geodetic (latitude, longitude, height)
 * @memberof module:geodetic
 * @property {number[]} point [x, y, z]
 * @returns {number[]} [latitude, longitude, height] (in degrees)
 * @see [Cartesian to Geodetic Coordinates without Iterations]{@link http://dx.doi.org/10.1061/(ASCE)0733-9453(2000)126:1(1)}
**/
function cartesianToGeodetic(point) {
    let [x, y, z] = point;
    const a = DATUM.SEMI_MAJOR_AXIS;
    const b = DATUM.SEMI_MINOR_AXIS;
    const E = DATUM.LINEAR_ECCENTRICITY;
    const X_SQUARED = squared(x);
    const Y_SQUARED = squared(y);
    const Z_SQUARED = squared(z);
    const Q = sqrt(X_SQUARED + Y_SQUARED);
    const R = sqrt(X_SQUARED + Y_SQUARED + Z_SQUARED);
    const E_SQUARED = squared(E);
    const R_SQUARED = squared(R);
    const R_SQUARED_MINUS_E_SQUARED = R_SQUARED - E_SQUARED;
    let u = sqrt(
        (1 / 2) * (R_SQUARED_MINUS_E_SQUARED + sqrt(squared(R_SQUARED_MINUS_E_SQUARED) + (4 * E_SQUARED * Z_SQUARED)))
    );
    const TAN_REDUCED_LATITUDE = (sqrt(squared(u) + E_SQUARED) * z) / (u * Q);
    const REDUCED_LATITUDE = atan(TAN_REDUCED_LATITUDE);
    const COS_REDUCED_LATITUDE = cos(REDUCED_LATITUDE);
    const SIN_REDUCED_LATITUDE = sin(REDUCED_LATITUDE);
    let latitude = atan((a / b) * TAN_REDUCED_LATITUDE);
    let longitude = atan2(y, x);
    let height = sqrt(
        squared(z - b * SIN_REDUCED_LATITUDE) + squared(Q - a * COS_REDUCED_LATITUDE)
    );
    return [deg(latitude), deg(longitude), Number(height.toFixed(1))];
}
/**
 * @function toDegreesMinutesSeconds
 * @memberof module:geodetic
 * @param {number[]} value Latitude or longitude expressed as [DDD, MMM, SSS]
 * @returns {number[]} [degrees, minutes, seconds]
 * @example <caption>Convert a decimal degree value</caption>
 * const {geodetic} = require('applied');
 * const val = [32.8303, 0, 0];
 * var dms = geodetic.convert.toDegreesMinutesSeconds(val);
 * console.log(dms);// [32, 49, 49.0800]
 * @example <caption>Convert a decimal degree minutes value</caption>
 * const {geodetic} = require('applied');
 * const val = [32, 49.818, 0];
 * let dms = geodetic.convert.toDegreesMinutesSeconds(val);
 * console.log(dms);// [32, 49, 49.0800]
**/
function toDegreesMinutesSeconds(value) {
    if (value.length !== GEOSPATIAL_VALUE_LENGTH) {
        return null;
    }
    let data = value;
    let dimension = data.length - data.slice(0).reverse().findIndex(function(val) {return abs(val) > 0;});
    let degrees = trunc(value[0]);
    let minutes = 0;
    let seconds = 0;
    /* istanbul ignore else */
    if (dimension === 1) {
        minutes = frac(data[0]) * MINUTES_PER_DEGREE;
        seconds = frac(minutes) * SECONDS_PER_MINUTE;
    } else if (dimension === 2) {
        minutes = trunc(data[1]);
        seconds = frac(data[1]) * SECONDS_PER_MINUTE;
    } else if (dimension === GEOSPATIAL_VALUE_LENGTH) {
        minutes = value[1];
        seconds = value[2];
    }
    return [
        degrees,
        trunc(minutes),
        seconds.toFixed(TEN_THOUSANDTHS)
    ].map(Number);
}
/**
 * @function toDegreesDecimalMinutes
 * @memberof module:geodetic
 * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
 * @returns {number[]} [degrees, minutes, seconds]
 * @example <caption>Convert a decimal degree value</caption>
 * const {geodetic} = require('applied');
 * const val = [32.8303, 0, 0];
 * let ddm = geodetic.convert.toDegreesDecimalMinutes(val);
 * console.log(ddm);// [32, 49.818]
 * @example <caption>Convert a degree minutes seconds value</caption>
 * const {geodetic} = require('applied');
 * const val = [32, 49, 49.0800];
 * let ddm = geodetic.convert.toDegreesDecimalMinutes(val);
 * console.log(ddm);// [32, 49.818]
**/
function toDegreesDecimalMinutes(value) {
    if (value.length !== GEOSPATIAL_VALUE_LENGTH) {
        return null;
    }
    let data = value;
    let dimension = data.length - clone(data).reverse().findIndex((val) => {return abs(val) > 0;});
    let degrees = trunc(data[0]);
    let minutes = 0;
    let seconds = 0;
    /* istanbul ignore else */
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
 * @function toDecimalDegrees
 * @memberof module:geodetic
 * @param {number[]} value Latitude or longitude expressed  as [DDD, MMM, SSS]
 * @returns {number}
 * @example <caption>Convert a degree minutes seconds value</caption>
 * const {geodetic} = require('applied');
 * const val = ['32', '49', '49.0800'];
 * let dd = geodetic.convert.toDecimalDegrees(val);
 * console.log(dd);// 32.8303
**/
function toDecimalDegrees(value) {
    let data = value;
    let sign = Math.sign(data[0]);
    data = data.map(Number).map(abs);
    data = sign * (data[0] + (data[1] / MINUTES_PER_DEGREE) + (data[2] / SECONDS_PER_DEGREE));
    return !isNaN(data) ? data : null;
}
