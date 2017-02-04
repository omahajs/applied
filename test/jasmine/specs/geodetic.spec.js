define(function(require) {
    'use strict';

    var _      = require('underscore');
    var geolib = require('index').geodetic;

    var EMPTY_VALUE = 0;
    var SANDIEGO_TO_OMAHA_KM = 2098;
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
        41.2500,           //decimal
        [41, 15.0000, 'N'],//hybrid
        [41, 15, 0, 'N']   //degees/minutes/seconds
    ];
    var omahaLon = [
        96.0000,          //decimal
        [96, 0.0000, 'W'],//hybrid
        [96, 0, 0, 'W']   //degees/minutes/seconds
    ];
    var sanDiegoLat = [
        32.7157,                 //decimal
        [32.7157, 42.942, 'N'],  //hybrid
        [32.7157, 42, 56.52, 'N']//degees/minutes/seconds
    ];
    var sanDiegoLon = [
        117.1611,                //decimal
        [117.1611, 9.666, 'W'],  //hybrid
        [117.1611, 9, 39.96, 'W']//degees/minutes/seconds
    ];
    var lat = [
        32.8303,              //decimal
        [32, 49.818, 'North'],//hybrid
        [32, 49, 49, 'n']     //degees/minutes/seconds
    ];
    var lon = [
        116.7762,             //decimal
        [116, 46.572, 'West'],//hybrid
        [116, 46, 34, 'w']    //degees/minutes/seconds
    ];

    describe('Geodetic module', function() {
        var value;
        var geo;
        var expectedValue;
        var testValues;
        var toDMS = geolib.convert.toDegreesMinutesSeconds;
        var toDDM = geolib.convert.toDegreesDecimalMinutes;
        var toDecDeg = geolib.convert.toDecimalDegrees;
        var toCartesian = geolib.convert.toCartesian;
        var toGeodetic = geolib.convert.toGeodetic;
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
        it('has appropriate data stored in DATUM and FORMATS objects', function() {
            expect(_.keys(geolib.DATUM).length).toEqual(_.values(geolib.DATUM).filter(_.isNumber).length);
            expect(_.keys(geolib.FORMATS).length).toEqual(_.values(geolib.FORMATS).filter(_.isString).length);
        });
        it('can not change DATUM or FORMATS data', function() {
            expect(Object.isFrozen(geolib.DATUM)).toBeTruthy();
            expect(Object.isFrozen(geolib.FORMATS)).toBeTruthy();
        });
        it('can convert to degrees / decimal-minutes', function() {
            expectedValue = [32, 49.818, 0];
            testValues = [
                [32.8303, 0, 0],
                [32, 49, 49.0800]
            ];
            convertAndCompare(toDDM, expectedValue, testValues);
            expectedValue = [-32, 49.818, 0];
            testValues = [
                [-32.8303, 0, 0],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(toDDM, expectedValue, testValues);
            expect(toDDM([-0, 0, 49.0800])).toEqual([-0, 0.818, 0]);
            expect(toDDM([0, 0, 49.0800])).toEqual([0, 0.818, 0]);
            expect(toDDM([-0, 42, 0])).toEqual([-0, 42, 0]);
            expect(toDDM([0, 42, 0])).toEqual([0, 42, 0]);
            expect(toDDM('invalid')).toBeNull();
            expect(toDDM([1, 2])).toBeNull();
        });
        it('can convert to degrees / minutes / seconds', function() {
            expectedValue = [32, 49, 49.0800];
            testValues = [
                [32.8303, 0, 0],
                [32, 49.818, 0],
                [32, 49, 49.0800]
            ];
            convertAndCompare(toDMS, expectedValue, testValues);
            expectedValue = [-32, 49, 49.0800];
            testValues = [
                [-32.8303, 0, 0],
                [-32, 49.818, 0],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(toDMS, expectedValue, testValues);
            expect(toDMS([0, 49, 0])).toEqual([0, 49, 0]);
            expect(toDMS([0, 0, 49.0800])).toEqual([0, 0, 49.0800]);
            expect(toDMS([32, 0, 49.0800])).toEqual([32, 0, 49.0800]);
            expect(toDMS('invalid')).toBeNull();
            expect(toDMS([1, 2])).toBeNull();
        });
        it('can convert to decimal-degrees', function() {
            expectedValue = 32.8303;
            testValues = [
                '32 49 49.0800 N',
                '32 49 49.0800',
                [32, 49, 49.0800, 'w'],
                [32, 49, 49.0800]
            ];
            convertAndCompare(toDecDeg, expectedValue, testValues);
            expectedValue = -32.8303;
            testValues = [
                '-32 49 49.0800 E',
                '-32 49 49.0800',
                [-32, 49, 49.0800, 's'],
                [-32, 49, 49.0800]
            ];
            convertAndCompare(toDecDeg, expectedValue, testValues);
            expect(toDecDeg('invalid')).toBeNull();
            expect(toDecDeg({})).toBeNull();
        });
        it('can convert to and from Cartesian', function() {
            var latitude = 41.25;
            var longitude = 96.0000;
            var height;
            //Cartesian for omaha lat/lon where the key is the height (in meters)
            var cartesiansFromCesium = {
                '0': {
                    x: -501980.225469305,
                    y: 4776022.813927791,
                    z: 4183337.213396747
                },
                '1000': {
                    x: -502058.8141290044,
                    y: 4776770.535078138,
                    z: 4183996.5592118474
                },
                '10000': {
                    x: -502766.1120662974,
                    y: 4783500.025431264,
                    z: 4189930.6715477477
                },
                '100000': {
                    x: -509839.09143922775,
                    y: 4776770.535078138,
                    z: 4183996.5592118474
                }
            }
            function testGeodeticAccuracy(cartesian, height, precision) {
                precision = precision ? precision : 4;
                var value = toGeodetic(
                    cartesian.x,
                    cartesian.y,
                    cartesian.z
                );
                if (height < 100000) {
                  expect(value[0]).toBeCloseTo(latitude,  precision);
                  expect(value[1]).toBeCloseTo(longitude, precision);
                  expect(value[2]).toBeCloseTo(height,    precision);
                } else {
                  expect(value[0]).not.toBeCloseTo(latitude,  precision);
                  expect(value[1]).not.toBeCloseTo(longitude, precision);
                  expect(value[2]).not.toBeCloseTo(height,    precision);
                }
            }
            function testCartesianAccuracy(latitude, longitude, height, precision) {
                precision = precision ? precision : 4;
                var value = toCartesian(latitude, longitude, height);
                var cartesian = cartesiansFromCesium[height];
                expect(value[0]).toBeCloseTo(cartesian.x, precision);
                expect(value[1]).toBeCloseTo(cartesian.y, precision);
                expect(value[2]).toBeCloseTo(cartesian.z, precision);
            }
            height = 0;
            testGeodeticAccuracy(cartesiansFromCesium[height], height);
            testCartesianAccuracy(latitude, longitude, height);
            height = 1000;
            testGeodeticAccuracy(cartesiansFromCesium[height], height);
            testCartesianAccuracy(latitude, longitude, height);
            height = 10000;
            testGeodeticAccuracy(cartesiansFromCesium[height], height);
            testCartesianAccuracy(latitude, longitude, height);
            height = 100000;
            testGeodeticAccuracy(cartesiansFromCesium[height], height);
        });
    });
});
