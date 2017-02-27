define(function(require, exports, module) {
    'use strict';

    var atmlib = require('index').atmosphere;

    var TROPOSPHERE_VALUES = [
        0,
        3.7,
        11
    ];
    var THERMOSPHERE_VALUES = [
        87,
        95.6,
        450.1,
        500
    ];

    describe('Atmosphere module', function() {
        it('can determine layer of atmosphere from altitude', function() {
            var getStrata = atmlib.getStrata;
            TROPOSPHERE_VALUES.forEach(function(altitude) {
                expect(getStrata(altitude)).toEqual('troposphere');
            });
            THERMOSPHERE_VALUES.forEach(function(altitude) {
                expect(getStrata(altitude)).toEqual('thermosphere');
            });
        });
        it('can calculate molecular weight of atmosphere', function() {
            var mol = atmlib.molecularWeight;
            expect(mol(0)).toEqual(28.964);
            expect(mol(12)).toEqual(26.66);
            expect(mol(21)).toEqual(16.17);
            expect(mol(22)).toEqual(28.964);
        });
        it('can calculate speed of sound based on altitude', function() {
            var speed = atmlib.calculate.speedOfSound;
            expect(speed()).toBeCloseTo(340.9, 1)// speed of sound at sea-level, 340.29
            expect(speed(1000)).toBeCloseTo(295.6, 1); // 336.103
            expect(speed(10000)).toBeCloseTo(295.6, 1);// 299.63,  299.5 (1962, 1976)
            expect(speed(50000)).toBeCloseTo(332.8, 1);// 329.799, 329.8 (1962, 1976)
            expect(speed(80000)).toBeCloseTo(267.1, 1);// 269.44,  282.5 (1962, 1976)
            expect(speed(84000)).toBeCloseTo(272.1, 1);// 269.44,  276.9 (1962, 1976)
            expect(speed(86000)).toBeCloseTo(274.6, 1);// 269.44,  274.1 (1962, 1976)
        });
        it('can convert m/s <<>> mach', function() {
            var speed = atmlib.calculate.speedOfSound;
            var toMach = atmlib.convert.metersPerSecondToMach;
            expect(toMach(speed())).toEqual(1);
            expect(toMach(speed(), 0)).toEqual(1);
            expect(toMach(speed(10000), 10000)).toEqual(1);
            console.info(toMach(speed(), 20000));
            console.info(speed(20000));
        });
    });
});
