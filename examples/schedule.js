#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

~function(){ var
   red = function($){ return "\033[31m"+$+"\033[0m" }
   
   infrastructure.execution.stage(
      new Execution(function(){
        console.log(red('FOO!')) }) )
   
   infrastructure.execution.stage(
      new Execution(function(){
        console.log(red('BAR!')) }) )
   
console.log("=== Let's go!")
new Stage().start() }()
