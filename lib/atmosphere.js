/**
 * @file Atmospheric, thermodynamic, and aerodynamic
 * @author Jason Wohlgemuth
 * @module atmosphere
**/
define(function(require, exports, module) {
    'use strict';

    var _ = require('lodash');

    /**
     * @namespace Atmospheric Strata
     * @description Altitude ranges for each atmospheric strata (in km)
    **/
    var ATMOSPHERIC_STRATA = {
        troposphere:  [0, 11],
        stratosphere: [11, 47],
        mesosphere:   [47, 86],
        thermosphere: [86, 500],
        exosphere:    [500, 10000]
    };

    var convert = {
        fpsToMach: function() {}
    };

    module.exports = {
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
});
