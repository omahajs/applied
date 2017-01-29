var tests = [];
for (var file in window.__karma__.files) {
    // Our test modules are named "<something>Spec.js"
    // If you decide to change the format of the file name this Regex
    // must reflect it.
    if (/\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/lib',
    deps: tests,
    paths: {
        //Project Dependencies
        underscore: '../node_modules/underscore/underscore',
        lodash:     '../node_modules/lodash/lodash.min',
        //Spies, Stubs, and fake servers (Jasmine is loaded by Karma plugin)
        sinon: '../node_modules/sinon/pkg/sinon'
    },
    // start test run, once Require.js is done
    callback: window.__karma__.start
});
