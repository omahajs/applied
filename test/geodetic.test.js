'use strict';

const values   = require('lodash/values');
const isNumber = require('lodash/isNumber');
const isString = require('lodash/isString');
const {calculate, convert, DATUM, FORMATS} = require('../lib/geodetic');

const getRadius   = calculate.radius;
const toDMS       = convert.toDegreesMinutesSeconds;
const toDDM       = convert.toDegreesDecimalMinutes;
const toDecDeg    = convert.toDecimalDegrees;
const toCartesian = convert.geodeticToCartesian;
const toGeodetic  = convert.cartesianToGeodetic;

const EMPTY_VALUE = 0;
const SANDIEGO_TO_OMAHA   = 2097903.6774;
const NORTHERN_TROPIC_DMS = [23, 26, 13.4];
const NORTHERN_TROPIC_DEG = 23.4370555555;
const directions = [
    'North', 'South', 'East', 'West',
    'north', 'south', 'east', 'west',
    'N', 'S', 'E', 'W',
    'n', 's', 'e', 'w'
];
const badDirections = [
    'NorthWest', 'SouthEast', 'Western', 'Easterly',
    'NW', 'NE', 'SE', 'SW',
    'B', 'A', 'D',
    'b', 'a', 'd'
];
const omahaLat = [
    41.2500,           //decimal
    [41, 15.0000, 'N'],//hybrid
    [41, 15, 0, 'N']   //degees/minutes/seconds
];
const omahaLon = [
    96.0000,          //decimal
    [96, 0.0000, 'W'],//hybrid
    [96, 0, 0, 'W']   //degees/minutes/seconds
];
const sanDiegoLat = [
    32.7157,                 //decimal
    [32.7157, 42.942, 'N'],  //hybrid
    [32.7157, 42, 56.52, 'N']//degees/minutes/seconds
];
const sanDiegoLon = [
    117.1611,                //decimal
    [117.1611, 9.666, 'W'],  //hybrid
    [117.1611, 9, 39.96, 'W']//degees/minutes/seconds
];
const lat = [
    32.8303,              //decimal
    [32, 49.818, 'North'],//hybrid
    [32, 49, 49, 'n']     //degees/minutes/seconds
];
const lon = [
    116.7762,             //decimal
    [116, 46.572, 'West'],//hybrid
    [116, 46, 34, 'w']    //degees/minutes/seconds
];

describe('Geodetic module', function() {
    let value;
    let geo;
    let expectedValue;
    let testValues;
    let expectValidLatitude = (value) => {
        expect(value.isEmpty()).toBeFalsy();
        expect(value.hasDirection()).toBeTruthy();
        expect(value.get('type')).toEqual('latitude');
    };
    let expectValidLongitude = (value) => {
        expect(value.isEmpty()).toBeFalsy();
        expect(value.hasDirection()).toBeTruthy();
        expect(value.get('type')).toEqual('longitude');
    };
    let convertAndCompare = (fn, expectedValue, testValues) => {
        testValues.forEach((val) => expect(fn(val)).toEqual(expectedValue));
    };
    it('has appropriate data stored in DATUM and FORMATS objects', () => {
        expect(Object.keys(DATUM).length).toEqual(values(DATUM).filter(isNumber).length);
        expect(Object.keys(FORMATS).length).toEqual(values(FORMATS).filter(isString).length);
    });
    it('can not change DATUM or FORMATS data', () => {
        expect(Object.isFrozen(DATUM)).toBeTruthy();
        expect(Object.isFrozen(FORMATS)).toBeTruthy();
    });
    it('calculate radius of the earth (WGS84 datum) at a given latitude', () => {
        expect(getRadius(0)).toEqual(DATUM.EARTH_EQUATOR_RADIUS);
        expect(getRadius(90)).toEqual(6361695.737933308);
        var latitude = toDecDeg(NORTHERN_TROPIC_DMS);
        expect(getRadius(latitude)).toEqual(6374410.938026696);
        expect(getRadius()).toEqual(DATUM.EARTH_MEAN_RADIUS);
    });
    it('can convert to degrees / decimal-minutes', () => {
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
    });
    it('can convert to degrees / minutes / seconds', () => {
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
        expect(toDMS(NORTHERN_TROPIC_DEG)).toEqual(NORTHERN_TROPIC_DMS);
        expect(toDMS('invalid')).toBeNull();
    });
    it('can convert to decimal-degrees', () => {
        let pairs = [
            [32.8303, [32, 49, 49.0800]],
            [-32.8303, [-32, 49, 49.0800]],
            [NORTHERN_TROPIC_DEG, NORTHERN_TROPIC_DMS]
        ];
        pairs.forEach((pair) => expect(toDecDeg(pair[1])).toBeCloseTo(pair[0], 9));
        expect(toDecDeg('invalid')).toBeNull();
        expect(toDecDeg({})).toBeNull();
    });
    it('can convert to and from Cartesian', () => {
        let height;
        const latitude = 41.25;
        const longitude = 96.0000;
        //Cartesian for omaha lat/lon where the key is the height (in meters)
        const cartesiansFromCesium = {
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
        function testGeodeticAccuracy(cartesian, height, precision = 4) {
            let value = toGeodetic(
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
        function testCartesianAccuracy(latitude, longitude, height, precision = 4) {
            let value = toCartesian(latitude, longitude, height);
            let cartesian = cartesiansFromCesium[height];
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
    it('can calculate distance with Haversine formula', () => {
        const getDistance = calculate.distance;
        const a = [omahaLat[0], omahaLon[0]];
        const b = [sanDiegoLat[0], sanDiegoLon[0]];
        expect(getDistance(a, b)).toBeCloseTo(SANDIEGO_TO_OMAHA, 4);
        expect(getDistance(b, a)).toBeCloseTo(SANDIEGO_TO_OMAHA, 4);
    });
});
