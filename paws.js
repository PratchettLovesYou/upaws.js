#!/usr/bin/env node

(function(){ var parse, Label, Execution
 , fs   = require('fs')
 , path = require('path')
   
 , paws = new Object()
   
   /* Parsing
   // ======= */ var descendTo
   paws.parse =
        parse = function(text){ var i, depth = 0, label = ''
    , script = new Array()
      
      reading:
      for (i; i < text.length; i++) {
         switch (text[i]) {
          break; case '{': 
          break; case '}': 
          break; case '(': descendTo(script, depth).push( new Array() )
                           depth++
          break; case ')': depth--
          break; case ' ': descendTo(script, depth).push( new Label(label) )
                           label = ''
          break; default : label = label + text[i]
                           continue reading
         }
      }
   }
   
   descendTo = function(expression, depth){ var i = 0
      while (i--) expression = expression[expression.length - 1]; return expression }
   
   /* Interpretation
   // ============== */
   paws.Label =
        Label = function(word){ this.string = word }
   
   paws.Execution =
        Execution = function(){}
   
   /* === == === /!\ === == === */ var
   it = path.normalize(process.argv[2])
   process.title = 'dem pawses'
   
   fs.stat(it, function(_, stats){ if(_)throw(_)
      fs.readFile(it, function(_, data){
         
      }) })
})()
