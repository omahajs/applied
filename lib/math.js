/**
 * @file Collection of common (and less common) mathematical utility functions
 * @author Jason Wohlgemuth
 * @module math
**/
'use strict';

const {acos, cos, PI} = Math;

const RADIANS_PER_DEGREE = PI / 180.0;
const DEGREES_PER_RADIAN = 180.0 / PI;

module.exports = {
    delta,
    deg,
    rad,
    hav,
    ahav
};

function delta(fn) {
    return (a, b) => (fn(a) - fn(b));
}
function deg(val) {
    return val * DEGREES_PER_RADIAN;
}
function rad(val) {
    return val * RADIANS_PER_DEGREE;
}
function hav(theta) {
    return 0.5 * (1 - cos(theta));
}
function ahav(x) {
    return acos(1 - (2 * x));
}
