<p align="center">
   <img src="https://github.com/Mahdios/upjson/blob/master/src/assets/upjson_logo_dark.png?raw=true" alt="Header">
</p>

<p align="center">
  Edit and write data to a json file asynchronously using db-like methods . Fast and easy!
</p>

<p align="center">
   <a href="https://www.npmjs.com/package/upjson">
    <img src="https://img.shields.io/node/v/upjson.svg?style=flat">
  </a>
  <a>
    <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat">
  </a>
  <a>
    <img src="http://hits.dwyl.com/Mahdios/upjson.svg">
  </a>
</p>

## Why? [![start with why](https://img.shields.io/badge/start%20with-why%3F-brightgreen.svg?style=flat)](http://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action)
- Uses no third party libraries
- Uses asynchronous methods utilizing the es6 syntax
- Fast and reliable
- Easy to use
- Lightweight and flexible
## Getting started
1- Install the package using npm (`npm i --save-dev upjson`) **OR** clone this repo
2- Require the package and create your database through the **UPJSON_DB** class

```js
// Example (uses node.js):
const { UPJSON_DB } = require('upjson');

const db = new UPJSON_DB('your/file/path'); // Don't worry if the file does'nt exist , the init method will fix that

db.init().then(console.log).catch(console.error); // This will create the file if it doesn't exist and makes sure it has the correct format
```
3- Consult the [docs](http://upjson.mahdios.gq) and get going.
## Copyright
This work is licensed under the Apache 2.0 license . All rights reserved to their respective owners.

<div align="center">
 <img src="https://nodei.co/npm/upjson.png?downloads=true&downloadRank=true&stars=true">
</div>
