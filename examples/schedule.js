#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

~function(){ var
   red   = function($){ return "\033[31m"+$+"\033[0m" }
 , green = function($){ return "\033[32m"+$+"\033[0m" }
   
 , arbitraryLock = new Empty()
   
 , foo = new Execution(
      function(rv){
         console.log(red('One,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(red('two,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(red('three!')) })
   
 , bar = new Execution(
      function(rv){
         console.log(green('Aeh,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(green('bee,'))
         infrastructure.execution.charge(this, this, arbitraryLock) }
    , function(rv){
         console.log(green('cee!')) })
   
   infrastructure.execution.stage(foo)
   infrastructure.execution.stage(bar)
   
console.log("=== Let's go!")
new Stage().start() }()

