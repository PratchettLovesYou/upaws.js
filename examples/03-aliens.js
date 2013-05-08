#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

// Example invocation:
//     ./examples/03-aliens.js

~function(){ var u
 , earth = new World()
   
 , foo = new Execution(
      function(rv, here){
         console.log(debug.ANSI.red('One,'))
         earth.stage(foo) }
    , function(rv, here){
         console.log(debug.ANSI.red('two,'))
         earth.stage(foo) }
    , function(rv, here){
         console.log(debug.ANSI.red('three!')) })
   
 , bar = new Execution(
      function(rv, here){
         console.log(debug.ANSI.green('Aeh,'))
         earth.stage(bar) }
    , function(rv, here){
         console.log(debug.ANSI.green('bee,'))
         earth.stage(bar) }
    , function(rv, here){
         console.log(debug.ANSI.green('cee!')) })
   
   earth.queue.push(new Staging(foo))
   earth.queue.push(new Staging(bar))
   
   console.log(debug.ANSI.bold("=== Let's go!"))
   earth.start()
   setTimeout(function(){ earth.stop() }, 1000) }()
