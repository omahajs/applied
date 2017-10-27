const {getRadius} = require('../../applied').geodetic;

module.exports = {
    name: 'Geodetic',
    tests: {
        'Calculate: Earth\'s Radius': function() {
            getRadius(0);
            getRadius(45);
            getRadius(90);
        }
    }
};
