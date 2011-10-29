#!/usr/bin/env node

(function(){ var Thing, Relation, Empty, Label, Execution, Native, Self, Expression, parse
 , fs   = require('fs')
 , path = require('path')
 , util = require('util')
   
 , paws = new Object()
   
                                                                                        paws.Thing =
   Thing = function(){
    //this.receiver = super
      this.metadata = [/*`Relationship`s*/] }                                       ;paws.Relation =
 //Thing.prototype.receiver = /* defined below */
   Relation = function(to, responsible){
      this.to = to || undefined
      this.responsible = responsible || undefined }
                                                                                        paws.Empty =
   Empty = function(){              Thing.call(this) }                                 ;paws.Label =
   Label = function(string){        Thing.call(this)
      this.string = string || undefined }                                          ;paws.Execution =
   Execution = function(something){ Thing.call(this)
      if (!something || typeof something === 'function')
         this.alien = something || undefined
      else {
         this.position = something || undefined
         this.stack = [] }
      
      this.pristine = true
      this.locals = null }
 //Execution.prototype.receiver = /* defined below */
   Execution.prototype.alien = function(){}
   
   Execution.prototype.
   complete = function(){
      if (this.alien) return false
      else            return typeof this.position === 'undefined' && this.stack.length === 0 }
   
   Execution.prototype.
   advance = function(rv) { var juxt, s
      if (this.alien)      return // FIXME: Do we need to “advance” aliens to coconsume?
      if (this.complete()) return
      
      if (!this.pristine) {
         if (typeof this.position === 'undefined') { 
            s = this.stack.pop()
            juxt = { context: this, left: s.value, right: rv }
            this.position = s.next
            return juxt } 
         else if (this.position.contents instanceof Expression) {
            this.stack.push({ value: rv, next: this.position.next })
            this.position = this.position.contents }
         else {
            juxt = { context: this, left: rv, right: this.position.contents }
            this.position = this.position.next
            return juxt } }
      
      this.pristine = false
      
      while (this.position.next.contents instanceof Expression) {
         this.stack.push({value: this.position.contents, next: this.position.next.next })
         this.position = this.position.next.contents }
      
      if (typeof this.position.next === 'undefined') {
         s = this.stack.pop()
         juxt = { context: this, left: s.value, right: this.position.contents }
         this.position = s.next
         return juxt }
      
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
   // ============== */ var Mask, Stage, Staging, metadataReceiver, executionReceiver   ;paws.Mask =
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
   
   Stage.current = undefined
   
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
      if (Stage.current)
         return process.nextTick(function(){ that.realize() })
      Stage.current = that
      
      if ( !(staging = Stage.queue.next()) ) return
      that.occupant = staging.stagee
      resumptionValue = staging.resumptionValue
      
      // We’ve already verified the requested mask’s availability, prior to accepting this
      // `Staging`, so no need to re-verify. If it’s defined, then we add it to the table.
      if (that.requestedMask) {
         Stage.ownershipTable.blamees.push(that.occupant)
         Stage.ownershipTable.masks.push(that.requestedMask) }
      
      if (that.occupant.alien) {
         that.occupant.alien.call(that.occupant, resumptionValue)
         that.occupant = undefined
         Stage.current = undefined
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
      } )(resumptionValue)
      
      that.occupant = undefined
      Stage.current = undefined }
   //                                                                       Thing.prototype.receiver =
   //metadataReceiver = function(arguments){ var caller = arguments.get(1)
   // , LEFT = arguments.get(2)
   // , RIGHT = arguments.get(3)
   //   
   //   for (var i = LEFT.metadata.length - 1; i >= 0; --i) {
   //      if (LEFT.get(i).get(1) ===
   //   }
   //   }
                                                                      Execution.prototype.receiver =
   executionReceiver = function(){}
   
   /* Alien families
   // ============== */ var infrastructure, neener_neener = {}, parseNum      ;paws.infrastructure =
   infrastructure = {
      get: function(_, thing, number){ number = parseNum(number)
         return thing.metadata[number].to }
    , set: function(_, thing, number, e){ number = parseNum(number)
         thing.metadata[number] = new Relation(e) }
    , affix: function(_, thing, e){
         thing.metadata.push(new Relation(e)) }
    , unaffix: function(_, thing){
         return thing.metadata.pop().to }
    , prefix: function(_, thing, e){
         thing.metadata.unshift(new Relation(e)) }
    , unprefix: function(_, thing){
         return thing.metadata.shift().to }
    , remove: function(_, thing, number){ number = parseNum(number)
         return thing.metadata.splice(number, 1)[0].to }
      
    , clone: function(_, thing){ var metadata = thing.metadata
         thing = new Empty()
         thing.metadata = metadata.map(function(relation){
            return new Relation(relation.to, relation.responsible) })
         return thing }
    , adopt: function(_, thing, other){
         thing.metadata = other.metadata.slice() } // IDFK: Utilizes identical `Relation`ships.
      // More note on the above: not sure how I’m going to define these semantics eventually, but
      // for the moment, the only sane way to call these if you don’t want weird behaviour where
      // changes to the responsibility-cascading grid affect unrelated objects.
      
    , receiver: function(_, thing){
         return thing.receiver }
    , setReceiver: function(_, thing, receiver){
         if (!receiver || typeof receiver === 'function')
            receiver = new Execution(receiver)
         thing.receiver = receiver }
      
    , charge: function(_, thing, number){ number = parseNum(number)
         thing.metadata[number].responsible = true }
    , discharge: function(_, thing, number){ number = parseNum(number)
         thing.metadata[number].responsible = false }
      
    , compare: function(_, thing1, thing2){
         return thing1 === thing2 } // FIXME: Currently a JavaScript boolean. Need Paws booleans.
      
    , label: {
         compare: function(_, label1, label2){
            return label1.string === label2.string }
       , clone: function(_, label){
            return new Label(label.string) } }
      
    , execution: {
         // TODO: way to determine branch-ship
         stage: function(_, execution, resumptionValue){
            Stage.queue.push(new Staging(execution, resumptionValue)) }
       , branch: function(_, execution){
            /* NYI */ }
         
       , charge: function(_, execution, thing){
            
            
            return neener_neener }
      }
   }
   
   parseNum = function(number){
      if (number instanceof Label)     number = parseInt(number.string, 10)
      if (typeof number !== 'number'
      || isNaN(number))                number = 0
      return number }
   
   /* Plumbing
   // ======== */
   // Remove all common elements from a pair of `Array`s.
   // !! DESTRUCTIVELY MODIFIES ITS ARGUMENTS !!
   Array.prototype.intersect = function(them){ var that = this
      this.slice().forEach(function(e){ var kill, iA, iB
         if (that.indexOf(e) + them.indexOf(e) > -2) {
            that.deleteAll(e)
            them.deleteAll(e) } }) }
   Array.prototype.union = function(){ /* NYI */ }
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
