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
        xit('can convert FPS <<>> mach', function() {
            //code
        });
    });
});
