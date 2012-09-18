#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

~function(){ var
   red   = function($){ return "\033[31;47m"+$+"\033[0m" }
 , green = function($){ return "\033[32;47m"+$+"\033[0m" }
   
   // The following is something like:
   //    
   //    arb = empty clone
   //    
   //    foo = { print ‘One,’
   //            charge  () (arb)
   //            unstage ()
   //            print ‘two,’
   //            charge  () (arb)
   //            unstage ()
   //            print ‘three!’ }
   //    
   //    bar = { print ‘Aeh,’
   //            charge  () (arb)
   //            unstage ()
   //            print ‘bee,’
   //            charge  () (arb)
   //            unstage ()
   //            print ‘cee!’ }
   //    
   //    stage (foo)
   //    stage (bar)
   //    
 , arbitraryLock = new Empty()
   
 , foo = new Execution(
      function(rv){
         console.log(red('(zero.)'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(red('One,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(red('two,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(red('three!')) })
   
 , bar = new Execution(
      function(rv){
         console.log(green('(zee.)'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(green('Aeh,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(green('bee,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(green('cee!')) })
   
   arbitraryLock._id_ = 'arbitraryLock'
   foo._id_ = 'foo'
   bar._id_ = 'bar'
   
   infrastructure.execution.stage(foo)
   infrastructure.execution.stage(bar)
   
console.log("=== Let's go!")
new Stage().start() }()

