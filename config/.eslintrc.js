var ALLOWED_MAGIC_NUMBERS = [-1, 0, 1, 2, 180.0, 1000];

module.exports = {
    env: {
        amd: true,
        browser: true,
        jquery: true,
        es6: true
    },
    extends: 'omaha-prime-grade',
    rules: {
        'valid-jsdoc': 'off',
        'no-magic-numbers': ['warn', {ignore: ALLOWED_MAGIC_NUMBERS}]
    }
}
