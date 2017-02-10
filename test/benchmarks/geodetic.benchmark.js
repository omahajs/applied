var geodetic = require('../../applied').geodetic;
var calculate = geodetic.calculate;
var convert = geodetic.convert;

module.exports = {
    name: 'Geodetic',
    tests: {
        'Calculate: Earth\'s Radius': function() {
            calculate.radius(0);
            calculate.radius(45);
            calculate.radius(90);
        }
    }
};
