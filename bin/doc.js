const fs = require('fs');
const acorn = require('acorn');

console.log(acorn.parse(fs.readFileSync('bin/test.es6.js'), {ecmaVersion: 6}));