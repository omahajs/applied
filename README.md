<p align="center">
    <img width="50%" alt="applied.js" src="https://dl.dropboxusercontent.com/s/fxhrif7vjdn9iii/applied-js.png?dl=0"/>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/applied">
      <img src="https://img.shields.io/npm/v/applied.svg"/>
    </a>
    <a href="https://travis-ci.org/jhwohlgemuth/applied">
      <img src="https://travis-ci.org/jhwohlgemuth/applied.svg?branch=master"/>
    </a>
    <a href='https://coveralls.io/github/jhwohlgemuth/applied?branch=master'>
        <img src='https://coveralls.io/repos/github/jhwohlgemuth/applied/badge.svg?branch=master' alt='Coverage Status' />
    </a>
    <a href="https://www.bithound.io/github/jhwohlgemuth/applied">
        <img src="https://www.bithound.io/github/jhwohlgemuth/applied/badges/score.svg" alt="bitHound Overall Score">
    </a>
    <a href="https://snyk.io/test/github/jhwohlgemuth/applied">
        <img src="https://snyk.io/test/github/jhwohlgemuth/applied/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/jhwohlgemuth/applied" style="max-width:100%;">
    </a>
</p>
</br>

> **Applied** mathematics toolkit implemented in **JS** (ECMAScript)

Usage
-----

> Coming soon...

Roadmap
-------

- Geodetic
  - [x] cartesian <<>> cartographic unit conversions
  - [x] Spheroid (WGS84) radius calculation
  - [x] Spherical distance calculations
- Atmosphere
  - [x] mach <<>> m/s conversions
  - [x] calculate speed of sound as function of altitude
- Thermal
  - [ ] temperature conversions (R, F, C, K)


Development
-----------

> **Note:**  Linux is the only actively supported OS for development

**Requirements:**
- Git
- Node.js ([nvm](https://github.com/creationix/nvm) is suggested)

**Installation:**

```bash
git clone git@github.com/jhwohlgemuth/applied.git
cd applied
#Install dependencies
npm install
#Verify applied installed correctly by running tests
npm test
```
**Workflow Tasks:**

- `npm test` > run test suite
- `npm run test:watch` > watch task for running tests
- `npm run test:build` > build module and verify that it can be loaded
- `npm run lint` > lint code
- `npm run lint:watch` > watch task for code linting
- `npm run build` > bundle code using browserify
- `npm run docs` > generate and view the documentation
