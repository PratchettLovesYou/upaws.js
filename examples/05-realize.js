#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

~function(){ var juxt, rv = 0, u = undefined
 , ex = new Execution( cPaws.parse(process.argv[2]) ).name('root')
 , whee = new Execution(function(rv){ var caller = rv
      console.log('whee.')
      return infrastructure.execution.stage(this, caller, new Label('')) })
   .name('whee!')
   
   console.log(debug.ANSI.bold("=== Let's go! ==="))
   new Stage().start()
   
   var bar = new Thing().name('bar')
     , foo = new Thing({bar: bar}).name('foo')
   ex.locals.push({foo: foo})
   
   var inf = new Thing({'whee!': whee}).name('infrastructure')
   ex.locals.push({infrastructure: inf})
   
   infrastructure.execution.stage(u,ex)
   
}()
