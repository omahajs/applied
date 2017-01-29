define(function(require) {
    'use strict';

    var _      = require('underscore');
    var geolib = require('geo');

    var EMPTY_VALUE = 0;
    var directions = [
        'North', 'South', 'East', 'West',
        'north', 'south', 'east', 'west',
        'N', 'S', 'E', 'W',
        'n', 's', 'e', 'w'
    ];
    var badDirections = [
        'NorthWest', 'SouthEast', 'Western', 'Easterly',
        'NW', 'NE', 'SE', 'SW',
        'B', 'A', 'D',
        'b', 'a', 'd'
    ];
    var omahaLat = [
        41.2500,            //decimal
        [41, 15.0000, 'N'], //hybrid
        [41, 15, 0, 'N']    //degees/minutes/seconds
    ];
    var omahaLon = [
        96.0000,           //decimal
        [96, 0.0000, 'W'], //hybrid
        [96, 0, 0, 'W']    //degees/minutes/seconds
    ];
    var lat = [
        32.8303,               //decimal
        [32, 49.818, 'North'], //hybrid
        [32, 49, 49, 'n']      //degees/minutes/seconds
    ];
    var lon = [
        116.7762,              //decimal
        [116, 46.572, 'West'], //hybrid
        [116, 46, 34, 'w']     //degees/minutes/seconds
    ];

    describe('geolib', function() {
        var value;
        var geo;
        var expectedValue;
        var testValues;
        var degreesMinutesSeconds = geolib.convert.toDegreesMinutesSeconds;
        var degreesDecimalMinutes = geolib.convert.toDegreesDecimalMinutes;
        var decimalDegrees = geolib.convert.toDecimalDegrees;
        function expectValidLatitude(value) {
            expect(value.isEmpty()).toBeFalsy();
            expect(value.hasDirection()).toBeTruthy();
            expect(value.get('type')).toEqual('latitude');
        }
        function expectValidLongitude(value) {
            expect(value.isEmpty()).toBeFalsy();
            expect(value.hasDirection()).toBeTruthy();
            expect(value.get('type')).toEqual('longitude');
        }
        function convertAndCompare(fn, expectedValue, testValues) {
            testValues.forEach(function(val) {
                expect(fn(val)).toEqual(expectedValue);
            });
        }
        it('has appropriate data stored in DATUM and GEOSPATIAL_FORMATS objects', function() {
            expect(_.keys(geolib.DATUM).length).toEqual(_.values(geolib.DATUM).filter(_.isNumber).length);
            expect(_.keys(geolib.GEOSPATIAL_FORMATS).length).toEqual(_.values(geolib.GEOSPATIAL_FORMATS).filter(_.isString).length);
        });
        it('can not change DATUM or GEOSPATIAL_FORMATS data', function() {
            expect(Object.isFrozen(geolib.DATUM)).toBeTruthy();
            expect(Object.isFrozen(geolib.GEOSPATIAL_FORMATS)).toBeTruthy();
        });
        it('can convert to degrees / decimal-minutes', function() {
            expectedValue = [32, 49.818, 0];
            testValues = [
                [32.8303, 0, 0],
                [32, 49, 49.0800]
            ];
            convertAndCompare(degreesDecimalMinutes, expectedValue, testValues);
            expectedValue = [-32, 49.818, 0];
            testValues = [
                [-32.8303, 0, 0],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(degreesDecimalMinutes, expectedValue, testValues);
            expect(degreesDecimalMinutes([-0, 0, 49.0800])).toEqual([-0, 0.818, 0]);
            expect(degreesDecimalMinutes([0, 0, 49.0800])).toEqual([0, 0.818, 0]);
            expect(degreesDecimalMinutes([-0, 42, 0])).toEqual([-0, 42, 0]);
            expect(degreesDecimalMinutes([0, 42, 0])).toEqual([0, 42, 0]);
            expect(degreesDecimalMinutes('invalid')).toBeNull();
            expect(degreesDecimalMinutes([1, 2])).toBeNull();
        });
        it('can convert to degrees / minutes / seconds', function() {
            expectedValue = [32, 49, 49.0800];
            testValues = [
                [32.8303, 0, 0],
                [32, 49.818, 0],
                [32, 49, 49.0800]
            ];
            convertAndCompare(degreesMinutesSeconds, expectedValue, testValues);
            expectedValue = [-32, 49, 49.0800];
            testValues = [
                [-32.8303, 0, 0],
                [-32, 49.818, 0],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(degreesMinutesSeconds, expectedValue, testValues);
            expect(degreesMinutesSeconds([0, 49, 0])).toEqual([0, 49, 0]);
            expect(degreesMinutesSeconds([0, 0, 49.0800])).toEqual([0, 0, 49.0800]);
            expect(degreesMinutesSeconds([32, 0, 49.0800])).toEqual([32, 0, 49.0800]);
            expect(degreesMinutesSeconds('invalid')).toBeNull();
            expect(degreesMinutesSeconds([1, 2])).toBeNull();
        });
        it('can convert to decimal-degrees', function() {
            expectedValue = 32.8303;
            testValues = [
                '32 49 49.0800 N',
                '32 49 49.0800',
                [32, 49, 49.0800, 'w'],
                [32, 49, 49.0800]
            ];
            convertAndCompare(decimalDegrees, expectedValue, testValues);
            expectedValue = -32.8303;
            testValues = [
                '-32 49 49.0800 E',
                '-32 49 49.0800',
                [-32, 49, 49.0800, 's'],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(decimalDegrees, expectedValue, testValues);
            expect(decimalDegrees('invalid')).toBeNull();
        });
    });
});
