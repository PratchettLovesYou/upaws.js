#!/usr/bin/env node

console.log(
   require('util').inspect(
      require('../µpaws').cPaws.parse(process.argv[2])
    , false, 10 ) )
