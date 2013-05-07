#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

// Example invocation:
//     DEBUG=9 ./examples/05-realize.js 'whee!()'
//     DEBUG=9 ./examples/05-realize.js 'implementation util print abc'


~function(){ var juxt, rv = 0, u = undefined
 , earth = new World
 , root = new Execution( cPaws.parse(process.argv[2]) ).name('root')
 , whee = new Execution(function(rv, $){ var caller = rv
      console.log('whee.')
      earth.stage(caller, new Label(''), $) })
   .name('whee!')
   
   earth.applyGlobals(root)
   
   console.log(debug.ANSI.bold("=== Let's go! ==="))
   earth.start()
   
   var bar = new Thing().name('bar')
     , foo = new Thing({bar: bar}).name('foo')
   root.locals.push({foo: foo})
   
   root.locals.push({'whee!': whee})
   
   earth.stage(root)
}()
