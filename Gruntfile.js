'use strict';

module.exports = function (grunt) {
    grunt.initConfig({
        package: grunt.file.readJSON('package.json'),
        copy: {
            cname: {
                src: 'CNAME',
                dest: 'docs/'
            }
        },
        /**
         * Generate documentation from JS comments using JSDoc3
         * @see {@link https://github.com/krampstudio/grunt-jsdoc}
        **/
        jsdoc: {
            app: {
                src: ['./lib/**/*.js'],
                dest: './docs',
                options: {
                    configure: './jsdoc.conf.js',
                    readme: 'README.md',
                    template: 'node_modules/minami'
                }
            }
        },
        benchmark: {
            options: { displayResults: true },
            all: {
                src: ['./test/benchmarks/*.js'],
                dest: './reports/benchmarks/results.csv'
            }
        }
    });
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
};
