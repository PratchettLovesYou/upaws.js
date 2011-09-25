#!/usr/bin/env node

(function(){ var parse, Label, Execution
 , fs   = require('fs')
 , path = require('path')
 , util = require('util')
   
 , paws = new Object()
   
   /* Parsing
   // ======= */ var descendTo
   paws.parse =
        parse = function(text){ var i = 0
      
      function expr() { var result = [], t
         while (t = (paren() || scope() || label())) { result.push(t) }
         return result }
      
      function paren() { var result
         if (whitespace() && character('(') && (result = expr()) && whitespace() && character(')')) {
            return result }
         else {
            return false } }
      
      function scope() { var result
         if (whitespace() && character('{') && (result = expr()) && whitespace() && character('}')) {
            return new Execution(result) }
         else {
            return false } }
      
      function label() { var result = ''
         whitespace()
         while ("(){} ".indexOf(text[i]) === -1 && i < text.length) {
            result = result.concat(text[i]); i++ }
         return result.length > 0 ? new Label(result) : false }
      
      function whitespace() { while (text[i] === ' ' && i < text.length) { i++ }; return true }
      
      function character(c) { if (text[i] === c) { i++; return true } else { return false } }
      
      return expr()
   }
   
   /* Interpretation
   // ============== */
   paws.Label =
        Label = function(word){ this.string = word }
   
   paws.Execution =
        Execution = function(expression){ this.root = expression }
   
   /* === == === /!\ === == === */ var
   it = path.normalize(process.argv[2])
   process.title = 'dem pawses'
   
   fs.stat(it, function(_, stats){ if(_)throw(_)
      fs.readFile(it, 'utf8', function(_, data){
         console.log(util.inspect( paws.parse(data) ))
      }) })
})()
