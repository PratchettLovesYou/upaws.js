#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

~function(){ var juxt, rv = 0
 , ex = new paws.Execution(
               paws.cPaws.parse(process.argv[2]) )
   
   while (!ex.complete()) {
      juxt = ex.advance(new paws.Label( rv.toString() ))
      console.log( ++rv
                 + ':   ' + util.inspect(juxt.left  && juxt.left.string)
                 + ' <- ' + util.inspect(juxt.right && juxt.right.string) )}
}()
