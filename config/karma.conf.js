'use strict';

var config = require('config').get('grunt');
var scripts = config.folders.app + '/' + config.files.scripts;       //app source
var templates = config.folders.assets + '/' + config.files.templates;//templates
module.exports = function(karmaConfig) {
    karmaConfig.set({
        basePath: '../',
        frameworks: ['requirejs', 'jasmine'],
        files: [
            {pattern: config.folders.test + '/config.js'},
            {pattern: scripts,                                                       included: false},//JS scripts
            {pattern: config.folders.test + '/' + config.folders.specs + '/**/*.js', included: false},//Jasmine specs
            {pattern: config.folders.test + '/data/**/*.js',                         included: false},//Data modules
            {pattern: config.folders.test + '/data/**/*.json',                       included: false},//Data JSON
            {pattern: 'node_modules/sinon/pkg/sinon.js',                             included: false},//SinonJS
            {pattern: 'node_modules/underscore/underscore.js',                       included: false},//Underscore
            {pattern: 'node_modules/lodash/lodash.min.js',                           included: false} //Lodash
        ],
        exclude: [config.folders.app + '/config.js'],
        preprocessors: {
            [scripts]: ['coverage']
        },
        coverageReporter: {
            dir: config.folders.reports + '/' + config.folders.coverage,
            includeAllSources: true,
            reporters: [
                {type: 'text-summary',subdir: '.', file: 'text-summary.txt'},
                {type: 'html', subdir: 'report-html'},
                {type: 'text-summary'},
                {type: 'lcov', subdir: 'report-lcov'},
                {type: 'cobertura', subdir: '.', file: 'report-cobertura.txt'}//Jenkins compatible
            ]
        },
        colors: true,
        logLevel: 'INFO', //DISABLE, ERROR, WARN, INFO, DEBUG
        captureTimeout: 60000,
        singleRun: true
    });
};
