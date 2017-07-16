'use strict';

const flow     = require('lodash/flow');
const get      = require('lodash/get');
const partial  = require('lodash/partial');
const constant = require('lodash/constant');
const {ahav, deg, delta, hav, rad} = require('../lib/math');

const DEG_RAD_PAIRS = [
    [0, 0],
    [45, Math.PI / 4],
    [90, Math.PI / 2],
    [180, Math.PI]
];
const HAVERSINE_TABLE = [
    [42, 0.1284],
    [50, 0.1786],
    [77, 0.3875]
];

describe('Math module', function() {
    it('can create delta function from a function', () => {
        let fn = partial(get, {
            a: 123,
            b: 234,
            c: 345
        });
        let D = delta(fn);
        expect(D('c', 'a')).toEqual(222);
    });
    it('can convert rad<<>>deg', () => {
        DEG_RAD_PAIRS.forEach((pair) => {
            expect(rad(pair[0])).toEqual(pair[1]);
            expect(pair[0]).toEqual(deg(pair[1]));
        });
    });
    it('can calculate haversine and archaversine', () => {
        let _hav = flow(rad, hav);
        HAVERSINE_TABLE.forEach((pair) => {
            expect(_hav(pair[0])).toBeCloseTo(pair[1], 4);
            expect(ahav(pair[1])).toBeCloseTo(rad(pair[0]), 3);
        });
    });
});
