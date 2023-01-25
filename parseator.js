const parser = require('./calc.js');
let data = process.argv[2];
let result = parser.parse(data.toString());
console.log(result);

