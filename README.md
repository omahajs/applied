<p align="center">
    <img height="200px" alt="applied.js" src="https://dl.dropboxusercontent.com/s/fxhrif7vjdn9iii/applied-js.png?dl=0"/>
</p>
</br>

[![npm](https://img.shields.io/npm/v/applied.svg)](https://www.npmjs.com/package/applied)
[![Build Status](https://travis-ci.org/omahajs/applied.svg?branch=master)](https://travis-ci.org/omahajs/applied)
[![Coverage Status](https://coveralls.io/repos/github/omahajs/applied/badge.svg?branch=master)](https://coveralls.io/github/omahajs/applied?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/omahajs/applied/badges/score.svg)](https://www.bithound.io/github/omahajs/applied)
[![Known Vulnerabilities](https://snyk.io/test/github/omahajs/applied/badge.svg)](https://snyk.io/test/github/omahajs/applied)


> **Applied** mathematics toolkit implemented in **JS** (ECMAScript)

Usage
-----

> Coming soon...

Roadmap
-------

- Geodetic
  - [x] cartesian <<>> cartographic unit conversions
  - [x] Spheroid (WGS84) radius calculation
  - [ ] Spherical distance calculations
- Atmosphere
  - [ ] mach <<>> feet-per-sec conversions

Development
-----------

> **Note:**  Linux is the only actively supported OS for development

**Requirements:**
- Git
- Node.js ([nvm](https://github.com/creationix/nvm) is suggested)

**Installation:**

```bash
git clone git@github.com/omahajs/applied.git
cd applied
#Install dependencies
npm install
#Verify applied installed correctly by running tests
npm test
```
**Workflow Tasks:**

- `npm test` > run test suite
- `npm run test:watch` > watch task for running tests
- `npm run lint` > lint code
- `npm run lint:watch` > watch task for code linting
- `npm run build` > bundle code using browserify
- `npm run docs` > generate and view the documentation
