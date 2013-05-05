#!/usr/bin/env node
// Example invocation:
//     DEBUG=9 ./examples/01-parse.js 'foo ({bar})'

console.log(
   require('util').inspect(
      require('../µpaws').cPaws.parse(process.argv[2])
    , false, 10 ) )
