#!/usr/bin/env node

(function(){ var Label, Execution, Native, Self, Expression, parse, Queue, execute
 , fs   = require('fs')
 , path = require('path')
 , util = require('util')
   
 , paws = new Object()
   
   paws.
   Label =
   Label = function(word){ this.string = word }
   
   paws.
   Execution =
   Execution = function(expression){ this.position = expression; this.stack = []; this.pristine = true; this.locals = [] }
   
   paws.Execution.prototype.
   advance = function(rv) {
      if (!this.pristine) {
         if (this.position.contents.constructor === Expression) {
            this.stack.push({ value: rv, next: this.position.next })
            this.position = this.position.contents
         } else {
            return { context: this, a: rv, b: this.position.contents }
         }
      }
      
      this.pristine = false
      
      while (this.position.contents.constructor === Expression || this.position.next.contents.constructor === Expression) {
         if (this.position.contents.constructor === Expression) {
            this.stack.push({ next: this.position.next })
            this.position = this.position.contents
         } else if (this.position.next.contents.constructor === Expression) {
            this.stack.push({value: this.position.contents, next: this.position.next.next })
            this.position = this.position.next.contents
         }
      }
      
      return { context: this, a: this.position.contents, b: this.position.next.contents }
   }
   
   paws.
   Native =
   Native = function(code){ this.code = code }
   
   paws.
   Self =
   Self = {}
   
   
   
   /* Parsing
   // ======= */                                                                   paws.Expression =
   Expression = function(contents, next){ this.contents = contents; this.next = next }
   
   paws.Expression.prototype.
   append = function(next) { var pos = this
      while (pos.next) { pos = pos.next }
      pos.next = next }
   
   parse = function(text){ var i = 0, e
      e = expr()
      console.log(text.slice(i, text.length))
      return e
      
      function expr() { var result = new Expression(Self), t
         while (t = (paren() || scope() || label())) { result.append(new Expression(t)) }
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
   }
   
   
   
   /* Interpretation
   // ============== */
   paws.
   Queue =
   Queue = []
   
   paws.
   execute = 
   execute =
   function(execution) {
      Queue.push(execution.advance(null))
      
      while (Queue.length > 0) {
         juxt = Queue.pop()
         if (juxt.b == null) break;
         juxtapose(juxt.context, juxt.a, juxt.b)
      }
   }
   
   paws.
   juxtapose =
   juxtapose =
   function(context, a, b) {
      switch (a.constructor) {
         break; case Native: 
            
         break; case Execution:
         break; case Self:
         break; case List: case Label:
      }
   }
   
   paws.
   stage =
   stage = function(execution, rv) { var juxtaposition
      juxtaposition = execution.advance(rv)
      Queue.push(juxtaposition)
   }
   
   
   
   /* === == === /!\ === == === */ var
   it = path.normalize(process.argv[2])
   process.title = 'dem pawses'
   
   fs.stat(it, function(_, stats){ if(_)throw(_)
      fs.readFile(it, 'utf8', function(_, data){
         var p = paws.parse(data)
         console.log(util.inspect( p , false, 10)) }) })
})()
