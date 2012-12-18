#!/usr/bin/env node
var /* Types: */           Thing, R,Relation, Label, Execution                                                    //|   // Code over here, beyond column 117, is not intended for the consumption of casual readers.
  , /* Parsing: */         cPaws, Expression                                                                      /*|*/;var undefined, u
  , /* Staging queue: */   Mask, World, Staging, metadataReceiver, executionReceiver
  , /* Aliens: */          ǁ,infrastructure, parseNum
  , /* Plumbing: */        inherits, construct, define, getter, chainee, noop
  , /* Debugging: */       P,I, D,debug, log, ANSI
   
  , USE_COLOR      = process.env['USE_COLOR'] === 'false' || true
  , DEBUG = parseInt(process.env['DEBUG'])
  , DEBUG = DEBUG === 0? 0:(DEBUG || 6)
   
  , fs   = require('fs')
  , path = require('path')
  , util = require('util')
   
  , paws = new Object()                                                                                           /*|*/;~function $(l,n){ l(function(i){n=i}); if(n)$(n) }
                                                                                                                  /*|*/ (function one($){ $(function two($){
                                                                                        paws.Thing =
   Thing = function(/* metadata... */){ var it = construct(this)
      it.id = Thing.counter++
      it.metadata = new Array
      it.push.apply(it, [].slice.apply(arguments))
      if (arguments.callee.caller !== arguments.callee
      &&  it.metadata.length > 0)
         it.metadata.unshift(undefined)
      return it }
   Thing.prototype.receiver = /* defined below */                                                                 /*|*/ undefined
   Thing.counter = 1
   
   Thing.inspectID = function(it) {
      return ANSI.brblack('❲'+it.id+'❳') }
   
   getter(Thing.prototype, 'named', function(){ return this.hasOwnProperty('name') })
   Thing.prototype.name = function(name){ this.name = name; return this }
   Thing.prototype._name = function(name){
      this        .named = true
      this        .toString = function(){ return name }; return this }
   
   Thing.prototype.toString = function(){ return this.named? this.name:'' }
   Thing.prototype.inspect = function(){ var indent = 0
      return function $$(it, i, seen, split){ var content, lines, old_seen = seen.slice()
         if (!split && seen.indexOf(it) >= 0)
            return Thing.inspectID(it)+it.toString(); else seen.push(it)
         
         if (it.metadata.length === 3
         &&  it.metadata[1] && it.metadata[1].to instanceof Label
         &&  it.metadata[2])
                content = ANSI.cyan(it.metadata[1].to.string+': ')
                        + $$(it.metadata[2].to, ++i, seen)
         else { content = Thing.inspectID(it)+ANSI.brwhite('(')
                        + it.toArray().map(function(thing){
            return thing? thing.constructor === Thing?
               $$(thing, ++i, seen) : thing.toString():'' })
            .join((split?"\n":'')+ANSI.brwhite(', '))+ANSI.brwhite(')')
            
            lines = content.split("\n")
            if (split)
               content = lines.join("\n   ")
            else if (ANSI.strip(lines.first).length > 60
                 ||  ANSI.strip(lines.last) .length > 60)
               return $$(it, 0, old_seen, true) }
            //else content = ANSI.wrap('48;5;'+(232+(i)),i>1?'48;5;'+(232+(i-1)):49)(content) }
         
         return content
         }(this, 0, []) }//+ANSI.SGR(49) }
                                                                                     paws.Relation =
   R=Relation = function(to, resp){ var it = construct(this)
      it.to = to || undefined
      it.isResponsible = resp || undefined
      return it }
   
   chainee(Relation.prototype, 'responsible',   function(){ this.isResponsible = true })
   chainee(Relation.prototype, 'irresponsible', function(){ this.isResponsible = false })
   getter(Thing.prototype,     'responsible',   function(){ return R(this).responsible })
   getter(Thing.prototype,     'irresponsible', function(){ return R(this).irresponsible })
   
   Thing.pair = function(key, value){ return new Thing( new Label(key), value ).responsible }
   
   Thing.prototype.toArray = function(){
      return this.metadata.map(function(e){ return e? e.to:e }) }
   
   Thing.toRelations = function(that, resp, seen){ var seen = seen || []
    , result = seen.lastThat(function(seen){ seen[0] === that })
            || seen.push([that, function $(){
      if (typeof that === 'object') switch (that.constructor){
         case Relation: return [that]
         case Execution: case Label: // FIXME: Ugly
         case Thing:    return [new Relation(that, resp)]
         case Array:    return [].concat.apply([]
                         , that.map(function(el){ return Thing.toRelations(el, resp, seen) }))
         default:       return Object.getOwnPropertyNames(that).map(function(key){ var
                           pair = new Thing(new Label(key).responsible) // May be redundant
                           pair.push.apply(pair, Thing.toRelations(that[key], resp, seen))
                           return pair.responsible }) } }()]) && seen.last
      return result[1] }
   
   Thing.prototype.push = function(){ this.metadata
    = this.metadata.concat(Thing.toRelations([].slice.apply(arguments))) }
   
   Thing.prototype.compare = function(right){ return this === right }
   
   Thing.prototype.lookup = function(key){
      return this.metadata.reverse().map(function(rel){
         return rel && rel.to instanceof Thing
             && rel.to.metadata[1] && rel.to.metadata[2]
             && rel.to.metadata[1].to.compare(key)?
                                      rel.to.metadata[2].to : undefined })
            .filter(function(_){return _}) }
                                                                                        paws.Label =
   Label = function(string){ it = construct(this)
      it.string = string || undefined
      return it }
   inherits(Thing, Label)
   Label.prototype.toString = function(){ return ANSI.cyan("'"+this.string+"'") }
   
   Label.prototype.compare = function(right){
      return right instanceof Label && this.string === right.string }
                                                                                   ;paws.Execution =
   Execution = function(something){ var   original, it = construct(this)
      if (something instanceof Execution) original = something
      
         it.pristine = original? original.pristine : true
      if (original && original.alien
      ||  typeof something === 'function') {
         it.alien = true
         it.subs = Array.prototype.slice.call(original? original.subs : arguments) }
      else {
         it.position = original? original.position      : something || undefined
         it.stack    = original? original.stack.slice() : new Array }
      
      if (original) // XXX: For now, clones are going to *share* locals.
         it.locals = original.locals
      else {
         it.locals = new Thing()._name(ANSI.brblack('locals'))
         it       .push({locals: R(it.locals, true)})
         it.locals.push({locals: R(it.locals, true)}) }
      
      if (original && original.hasOwnProperty('name'))
         it.name = original.name + '′'
      return it }
   inherits(Thing, Execution)
   Execution.prototype.receiver = /* defined below */                                                             /*|*/ undefined
   
   Execution.synchronous = function(world, func){ var it = new Execution(new Function)
      it.subs = new Array(func.length).join().split(',').map(function(){
         return function(caller, rv){
            this.subs.last = this.subs.last.bind(this, rv)
            world.queue.push(new Staging(caller, this)) } })
      
      it.subs.first = function(caller){ var that = this
         that.subs = that.subs.map(function(sub){ return sub.bind(that, caller) })
         world.queue.push(new Staging(caller, that)) }
      
      it.subs[func.length] = Function.apply(null, ['paws', 'world', 'func', 'caller'].concat(
         Array(func.length + 1).join('_').split(''),                                            "\n"
          +"var rv = func.apply(this, [].slice.call(arguments, 4))"                            +"\n"
          +"if (typeof rv !== 'undefined')"                                                    +"\n"
          +   "world.infrastructure.execution.stage(caller, rv)"))
      .bind(it, paws, world, func)
      
      return it }
      
   
   Execution.prototype.toString = function toString() { return this.alien
    ? ANSI.brmagenta(this.named? '´'+this.name+'´' : '´anon´')
    : ANSI.brmagenta(this.named? '`'+this.name+'`' : '`anon`') }
   Execution.prototype.inspect = function() { var rv = new Array
     !this.alien && this.stack.length > 0 && rv.push(ANSI.brblack('stack:    ')
       + ANSI.brwhite('[') + this.stack.reverse().map(function(e){
            return Thing.prototype.inspect.call(e) })
               .join(ANSI.brwhite(', ')) + ANSI.brwhite(']'))
     !this.alien && rv.push(ANSI.brblack('position: ')
       + (this.position? this.position.inspect()
                       : Expression.prototype.inspect.call({genesis: this.genesis})))
      this.alien && rv.push(ANSI.brblack('subs: ')+this.subs.length)
      rv.push(ANSI.brblack('locals:   ')+this.locals.inspect())
      return rv.join("\n") }
   
   Execution.prototype.
   complete = function(){
      if (this.alien) return !this.subs.length
      else            return typeof this.position === 'undefined' && this.stack.length === 0 }
   
   Execution.prototype.clone = function(){ return new Execution(this) }
   
   Execution.prototype.
   advance = function(rv) { var juxt, s
      if (this.complete()) return
      if (this.alien)    { this.pristine = false
                           return this.subs.splice(0, 1)[0].bind(this) }
      
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
      
      while (this.position.next && this.position.next.contents instanceof Expression) {
         this.stack.push({value: this.position.contents, next: this.position.next.next })
         this.position = this.position.next.contents }
      
      if (typeof this.position.next === 'undefined') {
         s = this.stack.pop()
         juxt = { context: this, left: s.value, right: this.position.contents || this }
         this.position = s.next
         return juxt }
      
      juxt = { context: this
             , left: this.position.contents || this.locals
             , right: this.position.next.contents }
      this.position = this.position.next.next;
      return juxt
   }
   
   
   /* Parsing
   // ======= */                                                                   paws.Expression =
   Expression = function(contents, next){ var it = construct(this)
      it.contents = contents || undefined
      it.next = next || undefined
      return it }
   
   Expression.prototype.toString = function(){}
   Expression.prototype.inspect = function(){ var g
      if (g = this.genesis)
         return  '{ '+ g.original.substring(0,          g.index[0])
          + ANSI.brred(g.original.substring(g.index[0], g.index[1]))
          +            g.original.substring(g.index[1])+' }'}
   
   Expression.prototype.
   append = function(next){ var pos = this
      while (pos.next) pos = pos.next
      pos.next = next }
                                                                                                                  /*|*/ paws.cPaws = cPaws = new Object()
   cPaws.labelCharacters = /[^(){} ]/ // Not currently supporting quote-delimited labels
   
   cPaws.
   parse = function(text){ var i = 0
    , genesis = function(result, a, z){ result.genesis =
       { original: text
       , index: [a, z]
       , string: text.slice(a, z) }
         return result }
      
    , character = function(c){ return text[i] === c && ++i }
    , whitespace = function(){ while (character(' ')); return true }
    , braces = function(chars, constructor) {
         return function(){ var a = i, $
            if (whitespace() && character(chars[0]) && ($ = expr()) && whitespace() && character(chars[1]))
               return genesis(new constructor($),a,i) } }
      
    , paren = braces('()', function(_){return _})
    , scope = braces('{}', Execution)
    , label = function(){ whitespace(); var a = i, $ = ''
         while ( text[i] && cPaws.labelCharacters.test(text[i]) )
            $ = $.concat(text[i++])
         return $ && genesis(new Label($),a,i) }
      
    , expr = function(){ var a = i, b = i, _, $ = new Expression()
         while (_ = paren() || scope() || label() ) {
            $.append( genesis(new Expression(_),b,i) ); b = i }
         return genesis($,a,i) }
      
      return expr() }
   
   
   
   /* Interpretation
   // ============== */
   Thing.prototype.receiver = new Execution(function(rv, world){ var arguments = rv.toArray()
    , results = arguments[1].lookup(arguments[2])
      if (results[0])
         world.queue.push(new Staging(arguments[0], results[0])) })
   .name('thing×')
   
   Execution.prototype.receiver = new Execution(function(rv, world){ var arguments = rv.toArray()
      world.queue.push(new Staging(arguments[1].clone(), arguments[2])) })
   .name('execution×')
                                                                                         paws.Mask =
   Mask = function(owner, roots){ var it = construct(this)
      it.owner = owner || undefined
      it.roots = roots || [/* Thing */]
      return it }
   
   // Returns an array of all of the things that this `Mask`’s `roots` are responsible for.
   Mask.prototype.flatten = function(){
      return this.roots.reduce(function(acc, root){ var $$
         return ($$ = function(acc, it){ acc.push(it)
            return it.metadata.reduce(function(acc, relation){
               if (relation.isResponsible) acc.push(relation.to)
               return acc }, acc) })(acc, root) }, new Array()) }
   
   // Compare with a foreign mask for conflicting responsibility
   Mask.prototype.conflictsWith = function(far){ if (far === this) return false; far = far.flatten()
      return this.flatten().some(function(it){ return far.indexOf(it) !== -1 }) }
   
   // Ascertain if a foreign mask is a subset of this mask
   Mask.prototype.contains = function(far){ if (far === this) return true
      return far.flatten().intersect(this.flatten()).length === 0 }
                                                                                        paws.World =
   World = function(){ var it = construct(this)
      it.occupant = undefined
      it.queue = [/* Staging */]
      it.ownershipTable = { blamees: [/* execution */]
                          , masks:   [/* Mask */] }
      
      it.infrastructure = this.ownBag(paws.infrastructure)
      
      return it }
   
   // Non-concurrent implementation! Yay! </sarcasm>
   World.current = undefined
   
   World.prototype.next = function(){
      // We look for the foremost element of the queue that either:
      // 1. isn’t already staged (inapplicable to this implementation),
      // 2. doesn’t have an associated `requestedMask`,
      // 3. is already responsible for a mask equivalent to the one requested,
      // 4. or whose requested mask doesn’t conflict with any existing ones, excluding its own
      for (var i = 0; i < this.queue.length; ++i) { var it = this.queue[i]
         alreadyResponsible = function(){
            return this.ownershipTable.masks
               .filter(function(mask, j){ return this.ownershipTable.blamees[j] === it.stagee })
                 .some(function(mask)   { return mask.contains(it.requestedMask)              }) }
       , requestConflicts = function(){
            return this.ownershipTable.masks
               .filter(function(mask, j){ return this.ownershipTable.blamees[j] !== it.stagee })
                 .some(function(mask)   { return it.requestedMask.conflictsWith(mask)         }) }
         
       , canBeStaged = !it.requestedMask
                    ||  alreadyResponsible()
                    || !requestConflicts()
         
         if (canBeStaged)
            return this.queue.splice(i,1)[0] }}
      
                                                                                      paws.Staging =
   Staging = function(stagee, resumptionValue, requestedMask){ var it = construct(this)
      it.stagee = stagee || undefined
      it.resumptionValue = resumptionValue || undefined
      it.requestedMask = requestedMask || undefined
      return it }
   
   World.prototype.record = function(requestedMask){
      this.ownershipTable.blamees.push(this.occupant)
      this.ownershipTable.masks.push(requestedMask) }
   World.prototype.invalidate = function(execution){ var table = this.ownershipTable
      table.blamees.forEach(function(blamee, i){
         if (blamee === execution) {
            table.blamees.splice(i,1)
            table.masks  .splice(i,1) } }) }
   
   World.prototype.realize = function(){ var that = this, staging, occupant, resumptionValue, $$
      // Every call to `realize()` will result in *exactly one* execution being staged for
      // realization. Even if this `World` is already realizing, then the requested realization will
      // simply be deferred to the next tick. Thus, three immediate-sequential calls to `realize()`
      // will result in `realize()` executing three times on three subsequent ticks.
      if (World.current)
         return process.nextTick(function(){
            World.current = undefined // FIXME: I have no idea where this infinite loop is from.
            that.realize() })
      World.current = that
      
      if (!(
         staging = that.next() )) return
      that.occupant = occupant = staging.stagee
      resumptionValue = staging.resumptionValue
      
      // We’ve already verified the requested mask’s availability, prior to accepting this
      // `Staging`, so no need to re-verify. If it’s defined, then we add it to the table.
      if (staging.requestedMask) that.record(staging.requestedMask)
      
      ~function(){ var juxt, receiver
         // Finally!
         // First, we handle the special-case of an alien Execution, and immediately return to
         // short-circuit handling of native executions;
         if (occupant.alien) {
            if (!occupant.complete())
                 occupant.advance()   .call(occupant, resumptionValue, that)
            return }
         
         if (!(
            juxt = occupant.advance(resumptionValue) )) return
         receiver = juxt.left.receiver.clone()
         resumptionValue = new Thing
         resumptionValue.push(juxt.context, juxt.left, juxt.right)
         
         that.queue.push(new Staging(receiver, resumptionValue))
      }()
      
      if (occupant.complete())
         that.invalidate(occupant)
      
      delete that.occupant
      delete World.current }
   
   World.prototype.intervalID = 0
   
   World.prototype.
   start = function(){
      if (!this.intervalID)
           this.intervalID = setInterval(this.realize.bind(this), 50) }                                                /*|*/;World.prototype.
   stop  = function(){
      if ( this.intervalID)
           this.intervalID = clearInterval(this.intervalID) }
   
   World.prototype.ownBag = function(bag){ here = this
      return bag
        .filter(function(el, key){ return key.charAt(0) != '_' })
        .map(function $$(el){ switch(typeof el){
            case 'function': return el.bind(null, here)
            case 'object':   return el.map($$) }}) }
   
   /* Alien families
   // ============== */                                                        paws.infrastructure =
   // FIXME: Much of the code here is a lie. This is a direct, on-the-stack JavaScript
   //        implementation, which Will Not Work™. Many of these aliens need do MSR or mutation, and
   //        thus need to charge and discharge things *themselves*, which means they (these aliens)
   //        need to propagate through the staging queue and whatnot. This is going to be complex ...
   // Then again, this is a non-concurrent implementation. Maybe that's fine? (Nope. Chuck Testa.)
// infrastructure = ǁ = {
//         get: function(thing, number){ return thing.metadata[parseNum(number)].to }
//  ,      set: function(thing, number, e){     thing.metadata[parseNum(number)] = new Relation(e) }
//  ,    affix: function(thing, e){             thing.metadata.push(new Relation(e)) }
//  ,  unaffix: function(thing){         return thing.metadata.pop().to }
//  ,   prefix: function(thing, e){             thing.metadata.unshift(new Relation(e)) }
//  , unprefix: function(thing){         return thing.metadata.shift().to }
//  ,   remove: function(thing, number){ return thing.metadata.splice(parseNum(number), 1)[0].to }
//    
//  , clone: function(thing){ var metadata = thing.metadata
//       thing = new Thing()
//       thing.metadata = metadata.map(function(relation){
//          return new Relation(relation.to, relation.isResponsible) })
//       return thing }
//  , adopt: function(thing, other){ thing.metadata = other.metadata.slice() } // IDFK: Utilizes identical `Relation`ships.
//    // More note on the above: not sure how I’m going to define these semantics eventually, but
//    // for the moment, the only sane way to call these if you don’t want weird behaviour where
//    // changes to the responsibility-cascading grid affect unrelated objects, is to `clone()`
//    // before `adopt()`ing.
//    
//  ,    receiver: function(thing){ return thing.receiver }
//  , setReceiver: function(thing, receiver){
//       if (!receiver || typeof receiver === 'function')
//          receiver = new Execution(receiver)
//       thing.receiver = receiver }
//    
//  ,    charge: function(thing, number){ thing.metadata[parseNum(number)].isResponsible = true }
//  , discharge: function(thing, number){ thing.metadata[parseNum(number)].isResponsible = false }
//    
//  , compare: function(thing1, thing2){ return thing1 === thing2 } // FIXME: Currently a JavaScript boolean. Need Paws booleans.
//    
//  , label: {
//       compare: function(label1, label2){ return label1.string === label2.string }
//     ,   clone: function(label){ return new Label(label.string) } }
//    
//  , execution: {
//       unstage: function(){ /* noop */ }
//       // TODO: way to determine branch-ship
//     , stage: function(_, execution, resumptionValue){
//          Stage.queue.push(new Staging(execution, resumptionValue))
//       ;( Stage.default ? Stage.default : new Stage() ).realize() }
//       
//     , branch: function(execution){ rv(/* NYI */) }
//       
//       // FIXME: Not exactly correct semantics, as this doesn't unstage the current execution.
//     , charge: function(_, execution, thing){
//          if (_ === execution) {
//             Stage.queue.push(new Staging(execution, undefined, new Mask(execution, [thing])))
//          ;( Stage.default ? Stage.default : new Stage() ).realize() }
//          else {
//             // FIXME: Needs to verify that the requested mask is a subgraph of the caller's,
//             //           or ensure the mask is requested next time the execution is staged
//             Stage.ownershipTable.add(new Mask(execution, [thing])) }}
//       
//    }
// }
   infrastructure = {
      get:        function($, thing, number){ return thing.metadata[parseNum(number)].to }
    , execution: {
         stage:      function($, execution, resumptionValue){
            $.queue.push(new Staging(execution, resumptionValue))
            $.realize()
            return new Label('') } // FIXME: How can I avoid resulting, here?
   }}
                                                                                                                  /*|*/;paws.utilities = new Object()
                                                                           paws.utilities.parseNum =
   parseNum = function(number){
      if (number instanceof Label)     number = parseInt(number.string, 10)
      if (typeof number !== 'number'
      || isNaN(number))                number = 0
      return number }
   
   /* Plumbing                                                                                                    /*|*/ }) // two()
   // ======== */
   noop = function noop(arg){ return arg }
   
   inherits = function(parent, constructor){ var
      F = new Function
      F.prototype = parent.prototype
      constructor.prototype = new F
      constructor.prototype.constructor = constructor
      constructor.parent = parent }
   
   construct = function(it, passed){ var F
    , caller = arguments.callee.caller
      
      if (caller.caller !== arguments.callee && it.constructor !== caller) {
        (F = new Function).prototype = caller.prototype
         it = new F }
      if (caller.parent) {
          caller.parent.apply(it, passed) }
      return it }
   
   
   define = function(prototype, property, value, setter){ var
           propertyAlreadyExists = prototype.hasOwnProperty(property)
         , descriptor = setter? { enumerable: false, get:   value, set: setter }
                              : { enumerable: false, value: value  }
      if (!propertyAlreadyExists) Object.defineProperty(prototype, property, descriptor) }
   
   getter =  function(){ define.apply(this, [].slice.apply(arguments).concat(noop)) }
   chainee = function(){ var a = arguments, b = [].slice.apply(arguments)
                             b[2] = function(){ a[2].apply(this, arguments); return this }
      getter.apply(this, [].slice.apply(b)) }
   
   define(Array.prototype, 'first', function( ){ return this[0] }
                                  , function($){        this[0] = $ })
   define(Array.prototype, 'last',  function( ){ return this[this.length? this.length - 1:0] }
                                ,   function($){        this[this.length? this.length - 1:0] = $ })
   define(Array.prototype, '-1',    function( ){ return this[this.length? this.length - 1:0] }
                               ,    function($){        this[this.length? this.length - 1:0] = $ })
   define(Array.prototype, '-2',    function( ){ return this[this.length? this.length - 2:0] }
                              ,     function($){        this[this.length? this.length - 2:0] = $ })
   
   getter(Array.prototype, 'empty',   function(){ return !this.filter(noop).length })
   define(Array.prototype, 'include', function(it){ return this.indexOf(it) !== -1 })
   
   // Remove all common elements from a pair of `Array`s.
   // !! DESTRUCTIVELY MODIFIES ITS ARGUMENTS !!
   define(Array.prototype, 'intersect', function(them){ var that = this
      this.slice().forEach(function(e){ var kill, iA, iB
         if (that.indexOf(e) + them.indexOf(e) > -2) {
            that.deleteAll(e)
            them.deleteAll(e) } })
      return this })
   define(Array.prototype, 'union', function(){ /* NYI */ })
   define(Array.prototype, 'deleteAll', function(element){ var i
      while ((i = this.indexOf(element)) !== -1)
         delete this[i] })
   
   define(Array.prototype, 'firstThat', function(_){ var rv
      return this                   .some(function(element){ return _(rv = element) }) ? rv : null })
   define(Array.prototype, 'lastThat', function(_){ var rv
      return this.slice(0).reverse().some(function(element){ return _(rv = element) }) ? rv : null })
   
   define(String.prototype, 'toFunction', function(){
      arguments = [].slice.apply(arguments.length? arguments:['it'])
      return global.eval('(function('+arguments.join(', ')+'){ return '+arguments[0]+this+' })') })
   
   define(Object.prototype, 'filter', function(cb){ var that = this
      return Object.getOwnPropertyNames(that).reduce(function(acc, key){
         if ( cb.call(that, that[key], key, that) )
            acc[key] = that[key]
         return acc }, new Object) })
   define(Object.prototype, 'map',    function(cb){ var that = this
      return Object.getOwnPropertyNames(that).reduce(function(acc, key){
         acc[key] = cb.call(that, that[key], key, that)
         return acc }, new Object) })
   define(Object.prototype, 'reduce', function(cb, initial){ var that = this
      return Object.getOwnPropertyNames(that).reduce(function(acc, key){
         return cb.call(that, acc, that[key], key, that) }, initial) })
   
   getter(Object.prototype, '‽', function(){ console.log(require('sys').inspect(this)); return this })
   getter(Object.prototype, '_', function(){ return this.toFunction? this.toFunction() : this })
   
   define(Function.prototype, 'calledBy', function(other, seen){ (seen = seen || []).push(this)
      if (seen.include(this.caller)) return false
      return !!this.caller && (this.caller === other || this.caller.calledBy(other, seen)) })
   
   /* Debugging
   // ========= */
   P = function P(it) {return (log.element||noop).call(log,
      it instanceof Thing? Thing.prototype.inspect.apply(it)
    : (it? it.toString() : ANSI.red('null')) )}
   I = function I(it) { var a, b, tag
      if (!(it instanceof Thing)) return (it?
         (it.inspect? it.inspect:it.toString).call(it) : ANSI.red('null') )
      if (log.element && /\n/.test(a = it.inspect()) || ANSI.strip(a).length >= 60) { tag = Thing.inspectID(it)
         b = log.element(tag + it.toString()); log.extra(tag, a); return b }
         else return a }
                                                                                        paws.debug =
   debug = function(level, before){ var level = level || 7, before = before || ''
    , caller = arguments.callee.caller.name || arguments.callee.caller.__identifier__
    , before = (caller? caller+'(':'')
         +ANSI.brblack('#'+(new Error).stack.split("\n")[2].split(':')[1])
         +(caller?')':'')+': '+before
      return DEBUG >= level? log(before):new Function }
  ;['emergency', 'alert', 'critical', 'error', 'warning', 'notice', 'info', 'debug', 'verbose', 'wtf']
      .forEach(function(name, level){ debug[name] = debug[level] = debug.bind(this, level) })
                                                                                         debug.log =
   log = function log_start(before){ var indent, elements = new Array
      if (typeof before === 'number') {indent = before; before = ''}
                                 else {before = ''+(before||''); indent = ANSI.strip(before).length+1}
      log.element = function(_){ elements.push([_]); return "\033*"+(elements.length-1) }
      log.extra   = function(tag, _){ elements[elements.length-1].push([tag, _]); return '' }
      return function log_end(text){ var
         output = Array.prototype.slice.call(arguments).join(', ')
            .replace(/\033\*(\d+)/g, function(_, n, offset, output){ return elements[n].shift() })
         
         console.log(before+output)
         elements.forEach(function(e){e.forEach(function(e){
            console.log( (e[0]+e[1]).split("\n").map(function(l){
               return new Array(ANSI.strip(e[0]).length+indent).join(' ')+l+' '
            }).join("\n").slice(ANSI.strip(e[0]).length) ) })})
         
         delete log.element; delete log.extra }}
                                                                                        debug.ANSI =
   ANSI = new Array
   ANSI[00] = 'reset';   ANSI[01] = 'bold';      ANSI[04] = 'underline'; ANSI[07] = 'negative'
   ANSI[30] = 'black';   ANSI[31] = 'red';       ANSI[32] = 'green';     ANSI[33] = 'yellow'
   ANSI[34] = 'blue';    ANSI[35] = 'magenta';   ANSI[36] = 'cyan';      ANSI[37] = 'white'; ANSI[39] = 'none'
   ANSI[90] = 'brblack'; ANSI[91] = 'brred';     ANSI[92] = 'brgreen';   ANSI[93] = 'bryellow'
   ANSI[94] = 'brblue';  ANSI[95] = 'brmagenta'; ANSI[96] = 'brcyan';    ANSI[97] = 'brwhite'; 
   ANSI.SGR = function SGR(code){return USE_COLOR? "\033["+code+'m' : '' }
   ANSI.wrap = function wrap_codes(start, end) { return function wrap_text(text){
      return ANSI.SGR(start)+text+ANSI.SGR(end) } }
   ANSI.regex = /\x1B\[([0-9]+(;[0-9]+)*)?m/g
   ANSI.strip = function strip(text){ return text.replace(ANSI.regex,'') }
   ANSI.forEach(function(name, code){ ANSI[name] = ANSI.wrap(code, 39) })
   ANSI.reset = ANSI.SGR(00)
   ANSI.bold = ANSI.wrap(1, 22); ANSI.underline = ANSI.wrap(04, 24); ANSI.underline = ANSI.wrap(07, 07)
                                                                                                                  /*|*/ }) // one()
   if (DEBUG >= 7) // This is about as robust as ... something not-very-robust. lolwhatever.
   ~function __identifier__(o, seen){ if (seen.indexOf(o) >= 0) return; seen.push(o)
      Object.getOwnPropertyNames(o).forEach(function(key){
         try { __identifier__(o[key], seen) } catch(_){}
         try { if (typeof o[key] == 'function' || o.__proto__ === Object.prototype)
            o[key].__identifier__ = key } catch(_){} })
      }(paws, [])
   
if(module)module.exports=paws
