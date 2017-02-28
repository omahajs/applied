var chalk = require('chalk');
var applied = require('../applied');
var atm = applied.atmosphere;
var geo = applied.geodetic;

var longitude = 32.7157;
var speed = atm.calculate.speedOfSound();

console.log('');
console.log(chalk.bold('Speed of Sound: ') + chalk.cyan(speed));
console.log('');
console.log(chalk.bold('Longitude: '));
console.log(chalk.dim('  Decimal: ') + chalk.cyan(longitude));
console.log(chalk.dim('  hybrid:  ') + chalk.cyan(geo.convert.toDegreesDecimalMinutes(longitude)));
console.log(chalk.dim('  DMS:     ') + chalk.cyan(geo.convert.toDegreesMinutesSeconds(longitude)));
console.log('');
console.log(chalk.bold.green('✓ ') + chalk.bold('Everything looks OK'));
console.log('');
