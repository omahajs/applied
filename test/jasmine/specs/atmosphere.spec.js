define(function(require, exports, module) {
    'use strict';

    var atmlib = require('index').atmosphere;

    describe('Atmosphere module', function() {
        it('can determine layer of atmosphere from altitude', function() {
            var getStrata = atmlib.getStrata;
            console.log(getStrata(11));
        });
        xit('can convert FPS <<>> mach', function() {
            //code
        });
    });
});
