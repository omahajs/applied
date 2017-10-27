var ALLOWED_MAGIC_NUMBERS = [-1, 0, 0.5, 1, 2, 3, 4, 180.0, 1000];

module.exports = {
    parser: 'babel-eslint',
    env: {
        node: true,
        es6: true
    },
    extends: 'omaha-prime-grade',
    rules: {
        'valid-jsdoc': 'off',
        'no-magic-numbers': ['warn', {ignore: ALLOWED_MAGIC_NUMBERS}]
    }
}
