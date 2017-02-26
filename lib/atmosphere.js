/**
 * @file Atmospheric, thermodynamic, and aerodynamic
 * @author Jason Wohlgemuth
 * @module atmosphere
**/
define(function(require, exports, module) {
    'use strict';

    var _     = require('lodash');
    var delta = require('./math').delta;

    /**
     * @constant SPECIFIC_HEAT_RATIO Specific heat ratio at sea-level
    **/
    var SPECIFIC_HEAT_RATIO = 1.405;
    /**
     * @constant R Sea-level gas constant for air (J/kg*K)
    **/
    var R = 287;
    /**
     * @constant NUMBER_OF_LAYERS Number of layers in atmospheric strata
    **/
    var NUMBER_OF_LAYERS = 21;
    /**
     * @namespace Atmospheric Strata
     * @description Altitude ranges for each atmospheric strata (in km)
    **/
    var ATMOSPHERIC_STRATA = {/* eslint-disable no-magic-numbers */
        troposphere:  [0, 11],
        stratosphere: [11, 47],
        mesosphere:   [47, 86],
        thermosphere: [86, 500],
        exosphere:    [500, 10000]
    };/* eslint-enable no-magic-numbers */

    var convert = {
        metersPerSecondToMach: convertMetersPerSecondToMach
    };

    module.exports = {
        molecularWeight: molecularWeight,
        getStrata: getAtmosphericStrata,
        convert: convert
    };

    /**
     * @function getAtmosphericStrata
     * @param {number} altitude Altitude (in km)
     * @returns {string} The name of the strata that contains the altitude
    **/
    function getAtmosphericStrata(altitude) {
        return _(ATMOSPHERIC_STRATA).findKey(function(val) {
            return _.head(val) <= altitude && altitude <= _.last(val);
        });
    }
    /**
     * @description Get molecular weight based on layer
     * @param {number} i Refers to the quantities at the base of the layer
     * @returns {number} molecular weight (in g/mole)
    **/
    function molecularWeight(i) {
        var MOLECULAR_WEIGHT_AT_SEA_LEVEL = 28.964;
        var M = [/* eslint-disable no-magic-numbers */
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
        return _(_.range(M.length)).includes(i) ? M[i] : MOLECULAR_WEIGHT_AT_SEA_LEVEL;
    }
    /**
     * @description Altitude with linear variation
     * @memberof module:atmosphere
     * @param {number} i Refers to the quantities at the base of the layer
     * @returns {number} altitude (in meters)
    **/
    function h(i) {
        var h = [/* eslint-disable no-magic-numbers */
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
        var layers = _.range(NUMBER_OF_LAYERS).map(h);
        var inLayer = _.partial(_.lte, altitude);
        return _(layers).findIndex(inLayer);
    }
    /**
     * @description Temperature with linear variation
     * @memberof module:atmosphere
     * @param {number} i Refers to the quantities at the base of the layer
     * @returns {number} temperature (in K)
    **/
    function temperature(i) {
        var T = [/* eslint-disable no-magic-numbers */
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
     * @description Thermal lapse rate
     * @memberof module:atmosphere
     * @param {number} i Refers to the quantities at the base of the layer
     * @returns {number} rate (in K/km)
    **/
    function a(i) {
        var a = [/* eslint-disable no-magic-numbers */
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
        ]/* eslint-enable no-magic-numbers */
        .map(function(a) {return a === 0 ? a : (a / 1000);});
        return a[i];
    }
    /**
     * @function calculateMolecularTemperature
     * @param {number} altitude
    **/
    function calculateMolecularTemperature(altitude) {
        var i = getLayerIndex(altitude);
        return temperature(i) + (a(i) * (altitude - h(i)));
    }
    /**
     * @function calculateKineticTemperature
     * @param {number} altitude
    **/
    function calculateKineticTemperature(altitude) {
        var i = getLayerIndex(altitude);
        var Mo = molecularWeight(0);
        var dM = delta(molecularWeight);
        var dh = delta(h);
        var Tm = calculateMolecularTemperature(altitude, i);
        var ratio = molecularWeight(i) + ((dM(i + 1, i) * (altitude - h(i))) / dh(i + 1, i));
        return (ratio / Mo) * Tm;
    }
    /**
     * @description Calculate the speed of sound at a given temparature
     * @param {number} altitude
     * @returns {number} speed of sound (in m/s)
    **/
    function calculateSpeedOfSound(altitude) {
        var temperature = calculateKineticTemperature(altitude);
        var radicand = SPECIFIC_HEAT_RATIO * R * temperature;
        return Math.sqrt(radicand);
    }
    /**
     * @function convertMetersPerSecondToMach
     * @param {number} altitude
     * @param {number} speed Speed in m/s
     * @returns {number} Mach number
    **/
    function convertMetersPerSecondToMach(altitude, speed) {
        return speed / calculateSpeedOfSound(altitude);
    }
});
