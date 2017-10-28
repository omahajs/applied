// @flow
/**
 * @file Collection of common (and less common) mathematical utility functions
 * @author Jason Wohlgemuth
 * @module math
**/

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

function delta(fn: (number) => number): (number, number) => number {
    return (a, b) => (fn(a) - fn(b));
}
function deg(val: number): number {
    return val * DEGREES_PER_RADIAN;
}
function rad(val: number): number {
    return val * RADIANS_PER_DEGREE;
}
function hav(theta: number): number {
    return 0.5 * (1 - cos(theta));
}
function ahav(x: number): number {
    return acos(1 - (2 * x));
}
