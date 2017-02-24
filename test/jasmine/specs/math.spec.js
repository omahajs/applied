define(function(require, exports, module) {
    'use strict';

    var _    = require('lodash');
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
        it('can convert rad<<>>deg', function() {
            DEG_RAD_PAIRS.forEach(function(pair) {
                var val = _(pair);
                expect(rad(val.head())).toEqual(val.last());
                expect(val.head()).toEqual(deg(val.last()));
            });
        });
        it('can calculate haversine and archaversine', function() {
            var hav = _.flow(rad, math.hav);
            var ahav = math.ahav;
            HAVERSINE_TABLE.forEach(function(pair) {
                expect(hav(_.head(pair))).toBeCloseTo(_.last(pair), 4);
                expect(ahav(_.last(pair))).toBeCloseTo(rad(_.head(pair)), 3);
            });
        });
    });
});
