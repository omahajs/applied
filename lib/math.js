/**
 * @file Collection of common (and less common) mathematical utility functions
 * @author Jason Wohlgemuth
 * @module math
**/
define(function(require, exports, module) {
    'use strict';

    var RADIANS_PER_DEGREE = Math.PI / 180.0;
    var DEGREES_PER_RADIAN = 180.0 / Math.PI;

    module.exports = {
        delta: delta,
        deg: deg,
        rad: rad,
        hav: hav,
        ahav: ahav
    };

    /**
     * @function delta
     * @todo Augment to accept arrays
    **/
    function delta(fn) {
        return function(a, b) {
            return fn(a) - fn(b);
        };
    }
    function deg(val) {
        return val * DEGREES_PER_RADIAN;
    }
    function rad(val) {
        return val * RADIANS_PER_DEGREE;
    }
    function hav(theta) {
        var cosTheta = Math.cos(theta);
        return 0.5 * (1 - cosTheta);
    }
    function ahav(x) {
        var inner = 1 - (2 * x);
        return Math.acos(inner);
    }
});
