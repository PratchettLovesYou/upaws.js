#!/usr/bin/env node

(function(){ var Label, Execution, Native, Self, Expression, parse
 , fs   = require('fs')
 , path = require('path')
 , util = require('util')
   
 , paws = new Object()
   
   paws.
   Label =
   Label = function(word){ this.string = word }
   
   paws.
   Execution =
   Execution = function(something){
      if (typeof something === 'function')
         this.alien = something
      else {
         this.position = something
         this.stack = [] }
      
      this.pristine = true
      this.locals = null }
   
   Execution.prototype.
   complete = function(){
      if (this.alien) return false
      else            return typeof this.position === 'undefined' && this.stack.length === 0 }
   
   Execution.prototype.
   advance = function(rv) { var juxt, s
      if (this.alien)      return // FIXME: Do we need to “advance” aliens to coconsume?
      if (this.complete()) return
      
      if (!this.pristine) {
         while (typeof this.position === 'undefined') { 
            s = this.stack.pop()
            if (typeof s.value !== 'undefined') {
               juxt = { context: this, left: s.value, right: rv }
               this.position = s.next
               return juxt } }
         if (this.position.contents instanceof Expression) {
            this.stack.push({ value: rv, next: this.position.next })
            this.position = this.position.contents
            juxt = { context: this, left: rv, right: this.position.contents }
            this.position = this.position.next
            return juxt
         }
      }
      
      this.pristine = false
      
      while (this.position     .contents instanceof expression
           ||this.position.next.contents instanceof expression) {
         if (this.position     .contents instanceof expression) {
             this.stack.push({ next: this.position.next})
             this.position = this.position.contents }
         else
         if (this.position.next.contents instanceof expression) {
            this.stack.push({value: this.position.contents, next: this.position.next.next })
            this.position = this.position.next.contents }
      }
      
      juxt = { context: this, left: this.position.contents, right: this.position.next.contents }
      this.position = this.position.next.next;
      return juxt
   }
   
   
   /* Parsing
   // ======= */                                                                   paws.Expression =
   Expression = function(contents, next){ this.contents = contents; this.next = next }
   
   paws.Expression.prototype.
   append = function(next) { var pos = this
      while (pos.next) { pos = pos.next }
      pos.next = next }
   
                                                                                       paws.parse =
   parse = function(text){ var i = 0, e
      e = expr()
      console.log(text.slice(i, text.length))
      return e
      
      function expr() { var result = new Expression(null), t
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
   // ============== */ var Mask, Stage, Staging, execute                               ;paws.Mask =
   Mask = function(owner, roots){
      this.owner = owner || undefined
      this.roots = roots || new Array() }
   
   // Returns an array of all of the things that this `Mask`’s `roots` are responsible for.
   Mask.prototype.flatten = function(){
      return this.roots.reduce(function(acc, root){ var $$
         return ($$ = function(acc, it){ acc.push(it)
            return it.relationships.reduce(function(acc, relationship){
               if (relationship.responsible) acc.push(relationship.target)
               return acc }, acc) })(acc, root) }, new Array()) }
   
   // Compare with a foreign mask for conflicting responsibility
   Mask.prototype.conflictsWith = function(far){ far = far.flatten()
      return this.flatten().some(function(it){ return far.indexOf(it) === -1 }) }
   
   // Ascertain if a foreign mask is a subset of this mask
   Mask.prototype.contains = function(far){ far = far.flatten().intersect(this.flatten())
      return far.length === 0 }
                                                                                        paws.Stage =
   Stage = function(){
      this.occupant = undefined }
   
   Stage.queue = [/* `Staging`s */]
   Stage.queue.push = function(){
      Array.prototype.push.apply(this, arguments)
      // FIXME: Get a particular instance of `Stage`, and schedule a `realize()`-ation
   }
   Stage.queue.next = function(){
      // We look for the foremost element of the queue that either:
      // 1. isn’t already staged (inapplicable to this implementation),
      // 2. doesn’t have an associated `requestedMask`,
      // 3. is already responsible for a mask equivalent to the one requested,
      // 4. or whose requested mask doesn’t conflict with any existing ones, excluding its own
      for (var i = 0; i < Stage.queue.length; ++i) { var it = Stage.queue[i]
         console.log(i+'.', it)
      var alreadyResponsible = function(){
            return Stage.ownershipTable.masks
               .filter(function(mask, j){ return Stage.ownershipTable.blamees[j] === it.stagee })
               .some(function(mask){ return mask.contains(it.requestedMask)}) }
       , requestConflicts = function(){
            return Stage.ownershipTable.masks
               .filter(function(mask, j){ return Stage.ownershipTable.blamees[j] !== it.stagee })
               .some(function(mask){ return mask.conflictsWith(it.requestedMask)}) }
         
       , canBeStaged = !it.requestedMask
                    ||  alreadyResponsible()
                    || !requestConflicts()
         
         console.log('->', !it.requestedMask, alreadyResponsible(), requestConflicts(), canBeStaged)
         
         if (canBeStaged)
            return Stage.queue.splice(i, 1)[0] }}
      
                                                                                      paws.Staging =
   Staging = function(stagee, resumptionValue, requestedMask){
      this.stagee = stagee || undefined
      this.resumptionValue = resumptionValue || undefined
      this.requestedMask = requestedMask || undefined }
   
   Stage.ownershipTable = { blamees: [/* `execution`s */]
                          , masks:   [/* `Mask`s */] }
   
   Stage.prototype.realize = function(){ var that = this, staging, resumptionValue, $$
      // Every call to `realize()` will result in *exactly one* execution being staged for
      // realization. Even if this `Stage` is already realizing, then the requested realization will
      // simply be deferred to the next tick. Thus, three immediate-sequential calls to `realize()`
      // will result in `realize()` executing three times on three subsequent ticks.
      if (that.occupant)
         return process.nextTick(function(){ that.realize() })
      
      if ( !(staging = Stage.queue.next()) ) return
      that.occupant = staging.stagee
      resumptionValue = staging.resumptionValue
      
      // TODO: Handle `staging.requestedMask`
      
      if (that.occupant.alien) {
         that.occupant.alien.call(that.occupant, resumptionValue)
         that.occupant = undefined
         return }
      
      ;($$ = function(resumptionValue){ var
         pair = that.occupant.advance(resumptionValue)
         // find juxtaposition handler
         // if alien, stack on an argument
         //    if has all arguments, call on-the-stack
         // if denizen, "call" pattern
         //    create staging
         //    (are we going to transfer ownerships for a call pattern?)
         //    queue staging
         //    unstage self
      } )(resumptionValue) }
   Stage.prototype.tock = function(){ var that = this
      
      
      
   }
                                                                                    paws.juxtapose =
   juxtapose =
   function(context, LEFT, RIGHT) {
      switch (a.constructor) {
                case Execution:
         break; case List:
         break; case Label:
      }
   }
   
   paws.
   stage =
   stage = function(execution, rv) {
      queue.push([execution, rv])
   }
   
   /* Plumbing
   // ======== */
   // Remove all common elements from a pair of `Array`s.
   // !! DESTRUCTIVELY MODIFIES ITS ARGUMENTS !!
   Array.prototype.intersect = function(them){ var that = this
      this.slice().forEach(function(e){ var kill, iA, iB
         if (that.indexOf(e) + them.indexOf(e) > -2) {
            that.deleteAll(e)
            them.deleteAll(e) } }) }
   Array.prototype.union = function(){ /* TODO: Implement me! */ }
   Array.prototype.deleteAll = function(element){ var i
      while ((i = this.indexOf(element)) !== -1)
         delete this[i] }
   
   /* === == === /!\ === == === */
   if (require && module && require.main === module) {                                           var
      it = path.normalize(process.argv[2])
      process.title = 'dem pawses'
      
      fs.stat(it, function(_, stats){ if(_)throw(_)
         fs.readFile(it, 'utf8', function(_, data){
            var p = paws.parse(data)
            console.log(util.inspect( p , false, 10)) }) })
   }
if(module)module.exports=paws})()
