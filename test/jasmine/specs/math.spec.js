define(function(require, exports, module) {
    'use strict';

    var flow = require('lodash/flow');
    var get = require('lodash/get');
    var partial = require('lodash/partial');
    var constant = require('lodash/constant');
    var math = require('index').math;
    var deg  = math.deg;
    var rad  = math.rad;

    var DEG_RAD_PAIRS = [
        [0, 0],
        [45, Math.PI / 4],
        [90, Math.PI / 2],
        [180, Math.PI]
    ];
    var HAVERSINE_TABLE = [
        [42, 0.1284],
        [50, 0.1786],
        [77, 0.3875]
    ];

    describe('Math module', function() {
        it('can create delta function from a function', function() {
            var fn = partial(get, {
                a: 123,
                b: 234,
                c: 345
            });
            var D = math.delta(fn);
            expect(D('c', 'a')).toEqual(222);
        });
        it('can convert rad<<>>deg', function() {
            DEG_RAD_PAIRS.forEach(function(pair) {
                expect(rad(pair[0])).toEqual(pair[1]);
                expect(pair[0]).toEqual(deg(pair[1]));
            });
        });
        it('can calculate haversine and archaversine', function() {
            var hav = flow(rad, math.hav);
            var ahav = math.ahav;
            HAVERSINE_TABLE.forEach(function(pair) {
                expect(hav(pair[0])).toBeCloseTo(pair[1], 4);
                expect(ahav(pair[1])).toBeCloseTo(rad(pair[0]), 3);
            });
        });
    });
});
