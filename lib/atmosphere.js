/**
 * @file Atmospheric, thermodynamic, and aerodynamic
 * @description Uses a combination of US Standard Atmospheres for 1962 and 1976
 * @author Jason Wohlgemuth
 * @module atmosphere
 * @see Atmospheric and Space Flight Dynamics: Modeling and Simulation with MATLAB and Simulink
 * (pages 226, 228-229)
 * [citation]{@link https://dl.acm.org/citation.cfm?id=1534352&preflayout=flat}
**/
'use strict';

const partial  = require('lodash/partial');
const lte      = require('lodash/lte');
const includes = require('lodash/includes');
const range    = require('lodash/range');
const findKey  = require('lodash/findKey');
const {delta}  = require('./math');
const {sqrt}   = Math;

/**
 * @constant SPECIFIC_HEAT_RATIO Specific heat ratio at sea-level
**/
const SPECIFIC_HEAT_RATIO = 1.405;
/**
 * @constant R Sea-level gas constant for air (J/kg*K)
**/
const R = 287;
/**
 * @constant NUMBER_OF_LAYERS Number of layers in atmospheric strata
**/
const NUMBER_OF_LAYERS = 21;
/**
 * @namespace Atmospheric Strata
 * @description Altitude ranges for each atmospheric strata (in km)
**/
const ATMOSPHERIC_STRATA = {/* eslint-disable no-magic-numbers */
    troposphere:  [0, 11],
    stratosphere: [11, 47],
    mesosphere:   [47, 86],
    thermosphere: [86, 500],
    exosphere:    [500, 10000]
};/* eslint-enable no-magic-numbers */

let convert = {
    metersPerSecondToMach: convertMetersPerSecondToMach
};
let calculate = {
    molecularTemperature: calculateMolecularTemperature,
    kineticTemperature: calculateKineticTemperature,
    speedOfSound: calculateSpeedOfSound
};
module.exports = {
    convert,
    calculate,
    molecularWeight,
    getStrata
};

/**
 * @function getStrata
 * @description Get atomospheric strata for a given altitude
 * @param {number} altitude Altitude (in km)
 * @returns {string} The name of the strata that contains the altitude
**/
function getStrata(altitude) {
    return findKey(ATMOSPHERIC_STRATA, (val) => {
        return val[0] <= altitude && altitude <= val[1];
    });
}
/**
 * @description Get molecular weight based on layer
 * @param {number} i Refers to the quantities at the base of the layer
 * @returns {number} molecular weight (in g/mole)
**/
function molecularWeight(i) {
    const MOLECULAR_WEIGHT_AT_SEA_LEVEL = 28.964;
    const M = [/* eslint-disable no-magic-numbers */
        MOLECULAR_WEIGHT_AT_SEA_LEVEL,
        28.964,
        28.964,
        28.964,
        28.964,
        28.964,
        28.962,
        28.962,
        28.880,
        28.560,
        28.070,
        26.920,
        26.660,
        26.500,
        25.850,
        24.690,
        22.660,
        19.940,
        17.940,
        16.840,
        16.170,
        16.17
    ];/* eslint-enable no-magic-numbers */
    return includes(range(M.length), i) ? M[i] : MOLECULAR_WEIGHT_AT_SEA_LEVEL;
}
/**
 * @private
 * @description Altitude with linear variation
 * @memberof module:atmosphere
 * @param {number} i Refers to the quantities at the base of the layer
 * @returns {number} altitude (in meters)
**/
function h(i) {
    const h = [/* eslint-disable no-magic-numbers */
        0,
        11019.1,
        20063.1,
        32161.9,
        47350.0,
        51412.5,
        71802.0,
        86000.0,
        100000,
        110000,
        120000,
        150000,
        160000,
        170000,
        190000,
        230000,
        300000,
        400000,
        500000,
        600000,
        2000000
    ];/* eslint-enable no-magic-numbers */
    return h[i];
}
function getLayerIndex(altitude) {
    let inLayer = partial(lte, altitude);
    return range(NUMBER_OF_LAYERS)
        .map(h)
        .findIndex(inLayer);
}
/**
 * @private
 * @description Temperature with linear variation
 * @memberof module:atmosphere
 * @param {number} i Refers to the quantities at the base of the layer
 * @returns {number} temperature (in K)
**/
function temperature(i) {
    const T = [/* eslint-disable no-magic-numbers */
        288.15,
        216.65,
        216.65,
        228.65,
        270.65,
        270.65,
        214.65,
        186.946,
        210.02,
        257.0,
        349.49,
        892.79,
        1022.2,
        1103.4,
        1205.4,
        1322.3,
        1432.1,,
        1487.4,
        1506.1,
        1506.1,
        1507.1
    ];/* eslint-enable no-magic-numbers */
    return T[i];
}
/**
 * @private
 * @description Thermal lapse rate
 * @memberof module:atmosphere
 * @param {number} i Refers to the quantities at the base of the layer
 * @returns {number} rate (in K/km)
**/
function a(i) {
    const lapseRates = [/* eslint-disable no-magic-numbers */
        -6.5,
        0,
        1,
        2.8,
        0,
        -2.8,
        -2.0,
        1.693,
        5,
        10,
        20,
        15,
        10,
        7,
        5,
        4,
        3.3,
        2.6,
        1.7,
        1.1,
        0
    ].map(function(a) {return a === 0 ? a : (a / 1000);});/* eslint-enable no-magic-numbers */
    return lapseRates[i];
}
/**
 * @function calculateMolecularTemperature
 * @param {number} altitude
**/
function calculateMolecularTemperature(altitude) {
    let i = getLayerIndex(altitude);
    return temperature(i) + (a(i) * (altitude - h(i)));
}
/**
 * @function calculateKineticTemperature
 * @param {number} altitude
**/
function calculateKineticTemperature(altitude) {
    let i = getLayerIndex(altitude);
    let Mo = molecularWeight(0);
    let dM = delta(molecularWeight);
    let dh = delta(h);
    let Tm = calculateMolecularTemperature(altitude, i);
    let ratio = molecularWeight(i) + ((dM(i + 1, i) * (altitude - h(i))) / dh(i + 1, i));
    return (ratio / Mo) * Tm;
}
/**
 * @function calculateSpeedOfSound
 * @description Calculate the speed of sound at a given temparature
 * @param {number} [altitude=0]
 * @returns {number} speed of sound (in m/s)
 * @example <caption>Speed of sound at sea-level</caption>
 * const {atmosphere} = require('applied');
 * let speed = atmosphere.calculate.speedOfSound();
 * console.log(speed);// 340.9 m/s
 * @example <caption>Speed of sound at 86 km</caption>
 * const {atmosphere} = require('applied');
 * let speed = atmosphere.calculate.speedOfSound(86000);
 * console.log(speed);// 274.6 m/s
**/
function calculateSpeedOfSound(altitude = 0) {
    let temperature = calculateKineticTemperature(altitude);
    let radicand = SPECIFIC_HEAT_RATIO * R * temperature;
    return sqrt(radicand);
}
/**
 * @function convertMetersPerSecondToMach
 * @param {number} speed Speed in m/s
 * @param {number} [altitude]
 * @returns {number} Mach number
 * @example
 * const {atmosphere} = require('applied');
 * const toMach = atmosphere.convert.metersPerSecondToMach;
 * let speed = atmosphere.calculate.speedOfSound();// speed at sea-level (altitude === 0)
 * toMach(speed);// 1
 * toMach(speed, 20000);// 1.15
**/
function convertMetersPerSecondToMach(speed, altitude) {
    return speed / calculateSpeedOfSound(altitude);
}
