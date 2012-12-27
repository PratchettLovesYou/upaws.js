#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

~function(){ var u
 , earth = new World()
   
 , foo = new Execution(
      function(rv, here){
         console.log(debug.ANSI.red('One,'))
         infrastructure.execution.stage(foo ,u, here) }
    , function(rv, here){
         console.log(debug.ANSI.red('two,'))
         infrastructure.execution.stage(foo ,u, here) }
    , function(rv, here){
         console.log(debug.ANSI.red('three!')) })
   
 , bar = new Execution(
      function(rv, here){
         console.log(debug.ANSI.green('Aeh,'))
         infrastructure.execution.stage(bar ,u, here) }
    , function(rv, here){
         console.log(debug.ANSI.green('bee,'))
         infrastructure.execution.stage(bar ,u, here) }
    , function(rv, here){
         console.log(debug.ANSI.green('cee!')) })
   
   earth.queue.push(new Staging(foo))
   earth.queue.push(new Staging(bar))
   
   console.log(debug.ANSI.bold("=== Let's go!"))
   earth.start() }()
