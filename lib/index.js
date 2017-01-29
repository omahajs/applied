define(function(require, exports) {
    'use strict';

    var _ = require('lodash');
    // var _ = require('underscore');
    // var _ = require('ramda');

    //
    // Utility library shim (Underscore, Lodash, or Ramda)
    //
    if (typeof(_.flow) !== 'function') {
        if (typeof(_.mixin) === 'function') {// Underscore
            _.mixin({
                complement: _.negate
            });
        } else {// Ramda
            _.constant = _.always;
        }
    } else {// Lodash
        _.any = _.some;
        _.complement = _.negate;
        _.compose = _.flowRight;
    }
    //
    // Polyfills
    //
    Math.sign = Math.sign || function(x) {
        x = +x;
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
    Math.trunc = Math.trunc || function(x) {
        return Math.sign(x) * _.compose(Math.floor, Math.abs)(x);
    };

    exports.geo = require('./geo');
});
