define(function(require, exports, module) {
    'use strict';

    var common = require('index').common;

    describe('Common utilities', function() {
        it('can validate number-like values', function() {
            var isNumberLike = common.isNumberLike;
            var truthyValues = [
                3,
                '42',
                '3.1415'
            ];
            var falsyValues = [
                'foo',
                'bar1',
                true,
                false,
                null,
                {}
            ];
            expect(truthyValues.map(isNumberLike).every(Boolean)).toBeTruthy();
            expect(falsyValues.map(isNumberLike).every(Boolean)).not.toBeTruthy();
        });
        it('can add leading zeroes', function() {
            var addLeadingZeroes = common.addLeadingZeroes;
            expect(addLeadingZeroes(7)).toEqual('007');
            expect(addLeadingZeroes(7, 5)).toEqual('00007');
            expect(addLeadingZeroes('not a number')).toBeNull();
        });
    });
});
