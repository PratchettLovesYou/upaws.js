#!/usr/bin/env node
var paws = require('../µpaws')
  , util = require('util')

Object.keys(paws)
   .forEach(function(key){
      global[key] = paws[key] })

// Example invocation:
//     DEBUG=9 ./examples/04-schedule.js

~function(){ var u
 , earth = new World()
   
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
 , some_thing = new Thing().name('some_thing')
 , some_child = new Thing().name('some_child')
   
 , greedy = new Execution(                                                           function(rv,$){
      debug.info(debug.ANSI.bold('(greedy)')+' ')
         ("Charged w/ "+debug.ANSI.brwhite('some_thing'))
      earth.own(greedy ,u, some_thing)
   /* earth.unstage(greedy) */                                                     },function(rv,$){
      debug.info(debug.ANSI.bold('(greedy)')+' ')
         ("Acquired "+debug.ANSI.brwhite('some_thing'))
      setTimeout(
         earth.stage.bind(earth)
                               , 2500, greedy)
   /* earth.unstage(greedy) */                                                     },function(rv,$){
      debug.info(debug.ANSI.bold('(greedy)')+' ')
         ("Discharged "+debug.ANSI.brwhite('some_thing'))                          }).name('greedy')
   
 , desirous = new Execution(                                                         function(rv,$){
      debug.info(debug.ANSI.bold('(desirous)')+' ')
         ("Charged w/ "+debug.ANSI.brwhite('some_child'))
      earth.own(desirous ,u, some_child)
   /* earth.unstage(desirous) */                                                   },function(rv,$){
      debug.info(debug.ANSI.bold('(desirous)')+' ')
         ("Acquired "+debug.ANSI.brwhite('some_child'))
      setTimeout(
         earth.stage.bind(earth)
                               , 1500, desirous)
   /* earth.unstage(desirous) */                                                   },function(rv,$){
      debug.info(debug.ANSI.bold('(desirous)')+' ')
         ("Discharged "+debug.ANSI.brwhite('some_child'))
      earth.stop()                                                               }).name('desirous')
   
   some_thing.metadata[1] = some_child.responsible
   
   earth.queue.push(new Staging(greedy))
   earth.queue.push(new Staging(desirous))
   
   console.log(debug.ANSI.bold("=== Let's go!"))
   earth.start()
}()
