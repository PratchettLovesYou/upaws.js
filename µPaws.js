#!/usr/bin/env node
var /* Types: */           Thing, R,Relation, Label, Execution                                                    //|   // Code over here, beyond column 117, is not intended for the consumption of casual readers.
  , /* Parsing: */         cPaws, Expression                                                                      /*|*/;var undefined, u
  , /* Staging queue: */   Mask, Stage, Staging, metadataReceiver, executionReceiver
  , /* Aliens: */          ǁ,infrastructure, parseNum
  , /* Plumbing: */        inherits, construct, getter, noop
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
      it._id = Thing.counter++
      it.metadata = new Array
      it.affix.apply(it, arguments)
      if (arguments.callee.caller !== arguments.callee)
         it.metadata.unshift(new R(new Thing, true)) }
   Thing.prototype.receiver = /* defined below */                                                                 /*|*/ undefined
   Thing.counter = 1
   
   Thing.inspect = function(it, bare) {
      return ANSI.brblack('❲'+it._id+'❳') + (bare? '':it.toString()) }
   
   getter(Thing.prototype, 'named',
      function(){ return this.hasOwnProperty('name') })
   Thing.prototype.name = function(name){ this.name = name; return this }
   Thing.prototype._name = function(name){
      this        .toString = function(){ return name }; return this }
   
   Thing.prototype.toString = function(){ return this.named? this.name:'' }
   Thing.prototype.inspect = function(){ return Thing.inspect(this, false) } 
   
   Thing.pair = function(key, value){ return new Thing( new Label(key), value ) }
   
   // Convenience approximation of libside `affix`
   Thing.prototype.affix = function(){ var it = this
      Array.prototype.slice.call(arguments).forEach(function(argument){
              if (argument instanceof Relation) it.metadata.push(argument)
         else if (argument instanceof Thing)    it.metadata.push(new Relation(argument))
         else if (argument) Object.getOwnPropertyNames(argument).forEach(function(key){
            it.metadata.push(new R(Thing.pair(key, argument[key]), true)) }) }) }
                                                                                     paws.Relation =
   R=Relation = function(to, responsible){ var it = construct(this)
      it.to = to || undefined
      it.responsible = responsible || undefined }
                                                                                        paws.Label =
   Label = function(string, MD){ it = construct(this, [MD])
      it.string = string || undefined }
   inherits(Thing, Label)
   Label.prototype.toString = function(){ return ANSI.cyan("'"+this.string+"'") }
                                                                                   ;paws.Execution =
   Execution = function(something, MD){ var it = construct(this)
         it.pristine = true
      if (typeof something === 'function') {
         it.alien = true
         it.subs = Array.prototype.slice.call(arguments) }
      else {
         it.position = something || undefined
         it.stack = [] }
      
      it.locals = new Thing()._name(ANSI.brblack('locals'))
      it       .affix({locals: it.locals})
      it.locals.affix({locals: it.locals}) }
   inherits(Thing, Execution)
   Execution.prototype.receiver = /* defined below */                                                             /*|*/ undefined
   
   Execution.prototype.
   complete = function(){
      if (this.alien) return !this.subs.length
      else            return typeof this.position === 'undefined' && this.stack.length === 0 }
   
   Execution.prototype.
   advance = function(rv) { var juxt, s
      if (this.complete()) return
      if (this.alien)    { this.pristine = false
                           return this.subs.splice(0, 1)[0] }
      
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
         juxt = { context: this, left: s.value, right: this.position.contents }
         this.position = s.next
         return juxt }
      
      juxt = { context: this, left: this.position.contents, right: this.position.next.contents }
      this.position = this.position.next.next;
      return juxt
   }
   
   
   /* Parsing
   // ======= */                                                                   paws.Expression =
   Expression = function(contents, next){ var it = construct(this)
      it.contents = contents || undefined
      it.next = next || undefined }
   
   Expression.prototype.
   append = function(next){ var pos = this
      while (pos.next) pos = pos.next
      pos.next = next }
                                                                                                                  /*|*/ paws.cPaws = cPaws = new Object()
   cPaws.labelCharacters = /[^(){} ]/ // Not currently supporting quote-delimited labels
   
   cPaws.
   parse = function(text){ var i = 0
    , character = function(c){ return text[i] === c && ++i }
    , whitespace = function(){ while (character(' ')); return true }
    , braces = function(chars, constructor) {
         return function(){ var $
            if (whitespace() && character(chars[0]) && ($ = expr()) && whitespace() && character(chars[1]))
               return new constructor($)
            else return false } }
      
    , paren = braces('()', function(_){return _})
    , scope = braces('{}', Execution)
    , label = function(){ whitespace(); var $ = ''
         while ( text[i] && cPaws.labelCharacters.test(text[i]) )
            $ = $.concat(text[i++])
         return $ && new Label($) }
      
    , expr = function(){ var _, $ = new Expression()
         while (_ = paren() || scope() || label() )
            $.append(new Expression(_))
         return $ }
      
      return expr() }
   
   
   
   /* Interpretation
   // ============== */                                                                  paws.Mask =
   Mask = function(owner, roots){ var it = construct(this)
      it.owner = owner || undefined
      it.roots = roots || [/* Thing */] }
   
   // Returns an array of all of the things that this `Mask`’s `roots` are responsible for.
   Mask.prototype.flatten = function(){
      return this.roots.reduce(function(acc, root){ var $$
         return ($$ = function(acc, it){ acc.push(it)
            return it.metadata.reduce(function(acc, relation){
               if (relation.responsible) acc.push(relation.to)
               return acc }, acc) })(acc, root) }, new Array()) }
   
   // Compare with a foreign mask for conflicting responsibility
   Mask.prototype.conflictsWith = function(far){ if (far === this) return false; far = far.flatten()
      return this.flatten().some(function(it){ return far.indexOf(it) !== -1 }) }
   
   // Ascertain if a foreign mask is a subset of this mask
   Mask.prototype.contains = function(far){ if (far === this) return true
      return far.flatten().intersect(this.flatten()).length === 0 }
                                                                                        paws.Stage =
   Stage = function(){ var it = construct(this)
      it.occupant = undefined
      if (!Stage.default) Stage.default = it }
   
   // Non-concurrent implementation! Yay! </sarcasm>
   Stage.current = undefined
   Stage.default = undefined
   
   Stage.queue = [/* Staging */]
   Stage.queue.next = function(){
      // We look for the foremost element of the queue that either:
      // 1. isn’t already staged (inapplicable to this implementation),
      // 2. doesn’t have an associated `requestedMask`,
      // 3. is already responsible for a mask equivalent to the one requested,
      // 4. or whose requested mask doesn’t conflict with any existing ones, excluding its own
      for (var i = 0; i < Stage.queue.length; ++i) { var it = Stage.queue[i]
         alreadyResponsible = function(){
            return Stage.ownershipTable.masks
               .filter(function(mask, j){ return Stage.ownershipTable.blamees[j] === it.stagee })
                 .some(function(mask)   { return mask     .contains(it.requestedMask)          }) }
       , requestConflicts = function(){
            return Stage.ownershipTable.masks
               .filter(function(mask, j){ return Stage.ownershipTable.blamees[j] !== it.stagee })
                 .some(function(mask)   { return it.requestedMask.conflictsWith(mask)          }) }
         
       , canBeStaged = !it.requestedMask
                    ||  alreadyResponsible()
                    || !requestConflicts()
         
         if (canBeStaged)
            return Stage.queue.splice(i,1)[0] }}
      
                                                                                      paws.Staging =
   Staging = function(stagee, resumptionValue, requestedMask){ var it = construct(this)
      it.stagee = stagee || undefined
      it.resumptionValue = resumptionValue || undefined
      it.requestedMask = requestedMask || undefined }
   
   Stage.ownershipTable = { blamees: [/* execution */]
                          , masks:   [/* Mask */] }
   Stage.ownershipTable.
   add = function(requestedMask){
      this.blamees.push(Stage.current.occupant)
      this.masks.push(requestedMask) }                                                                            /*|*/ ;Stage.ownershipTable.
   invalidate = function(execution){ var that = this
      that.blamees.forEach(function(blamee, i){
         if (blamee === execution) {
            that.blamees.splice(i,1)
            that.masks  .splice(i,1) } }) }
   
   Stage.prototype.realize = function(that){ var staging, resumptionValue, $$
                               that = that || this
      // Every call to `realize()` will result in *exactly one* execution being staged for
      // realization. Even if this `Stage` is already realizing, then the requested realization will
      // simply be deferred to the next tick. Thus, three immediate-sequential calls to `realize()`
      // will result in `realize()` executing three times on three subsequent ticks.
      if (Stage.current)
         return process.nextTick(function(){
            Stage.current = undefined // FIXME: I have no idea where this infinite loop is from.
            that.realize() })
      Stage.current = that
      
      if (!(
         staging = Stage.queue.next() )) return
      that.occupant = staging.stagee
      resumptionValue = staging.resumptionValue
      
      // We’ve already verified the requested mask’s availability, prior to accepting this
      // `Staging`, so no need to re-verify. If it’s defined, then we add it to the table.
      if (staging.requestedMask) Stage.ownershipTable.add(staging.requestedMask)
      
      ~function(){
         // Finally!
         // First, we handle the special-case of an alien Execution, and immediately return to
         // short-circuit handling of native executions;
         if (that.occupant.alien) {
            if (!that.occupant.complete())
                 that.occupant.advance()   .call(that.occupant, resumptionValue)
            return }
         
         // NYI: ... and then, failing that, proceed to handle native executions.
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
      }()
      
      if (that.occupant.complete())
         Stage.ownershipTable.invalidate(that.occupant)
      
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
   
   Stage.prototype.
   intervalID = 0
   
   Stage.prototype.
   start = function(){
      if (!this.intervalID)
           this.intervalID = setInterval(this.realize, 50, this) }                                                /*|*/;Stage.prototype.
   stop  = function(){
      if ( this.intervalID)
           this.intervalID = clearInterval(this.intervalID) }
   
   /* Alien families
   // ============== */                                                        paws.infrastructure =
   // FIXME: Much of the code here is a lie. This is a direct, on-the-stack JavaScript
   //        implementation, which Will Not Work™. Many of these aliens need do MSR or mutation, and
   //        thus need to charge and discharge things *themselves*, which means they (these aliens)
   //        need to propagate through the staging queue and whatnot. This is going to be complex ...
   // Then again, this is a non-concurrent implementation. Maybe that's fine? (Nope. Chuck Testa.)
   infrastructure = ǁ = {
           get: function(thing, number){ return thing.metadata[parseNum(number)].to }
    ,      set: function(thing, number, e){     thing.metadata[parseNum(number)] = new Relation(e) }
    ,    affix: function(thing, e){             thing.metadata.push(new Relation(e)) }
    ,  unaffix: function(thing){         return thing.metadata.pop().to }
    ,   prefix: function(thing, e){             thing.metadata.unshift(new Relation(e)) }
    , unprefix: function(thing){         return thing.metadata.shift().to }
    ,   remove: function(thing, number){ return thing.metadata.splice(parseNum(number), 1)[0].to }
      
    , clone: function(thing){ var metadata = thing.metadata
         thing = new Thing()
         thing.metadata = metadata.map(function(relation){
            return new Relation(relation.to, relation.responsible) })
         return thing }
    , adopt: function(thing, other){ thing.metadata = other.metadata.slice() } // IDFK: Utilizes identical `Relation`ships.
      // More note on the above: not sure how I’m going to define these semantics eventually, but
      // for the moment, the only sane way to call these if you don’t want weird behaviour where
      // changes to the responsibility-cascading grid affect unrelated objects, is to `clone()`
      // before `adopt()`ing.
      
    ,    receiver: function(thing){ return thing.receiver }
    , setReceiver: function(thing, receiver){
         if (!receiver || typeof receiver === 'function')
            receiver = new Execution(receiver)
         thing.receiver = receiver }
      
    ,    charge: function(thing, number){ thing.metadata[parseNum(number)].responsible = true }
    , discharge: function(thing, number){ thing.metadata[parseNum(number)].responsible = false }
      
    , compare: function(thing1, thing2){ return thing1 === thing2 } // FIXME: Currently a JavaScript boolean. Need Paws booleans.
      
    , label: {
         compare: function(label1, label2){ return label1.string === label2.string }
       ,   clone: function(label){ return new Label(label.string) } }
      
    , execution: {
         unstage: function(){ /* noop */ }
         // TODO: way to determine branch-ship
       , stage: function(_, execution, resumptionValue){
            Stage.queue.push(new Staging(execution, resumptionValue))
         ;( Stage.default ? Stage.default : new Stage() ).realize() }
         
       , branch: function(execution){ rv(/* NYI */) }
         
         // FIXME: Not exactly correct semantics, as this doesn't unstage the current execution.
       , charge: function(_, execution, thing){
            if (_ === execution) {
               Stage.queue.push(new Staging(execution, undefined, new Mask(execution, [thing])))
            ;( Stage.default ? Stage.default : new Stage() ).realize() }
            else {
               // FIXME: Needs to verify that the requested mask is a subgraph of the caller's,
               //           or ensure the mask is requested next time the execution is staged
               Stage.ownershipTable.add(new Mask(execution, [thing])) }}
         
      }
   }                                                                                                              /*|*/;paws.utilities = new Object()
                                                                           paws.utilities.parseNum =
   parseNum = function(number){
      if (number instanceof Label)     number = parseInt(number.string, 10)
      if (typeof number !== 'number'
      || isNaN(number))                number = 0
      return number }
   
   /* Plumbing                                                                                                    /*|*/ }) // two()
   // ======== */
   getter = function getter(object, property, getter) {
      if (!object.hasOwnProperty(property))
         Object.defineProperty(object, property, { get:getter, enumerable:false }) }
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
   
   // Remove all common elements from a pair of `Array`s.
   // !! DESTRUCTIVELY MODIFIES ITS ARGUMENTS !!
   Array.prototype.intersect = function(them){ var that = this
      this.slice().forEach(function(e){ var kill, iA, iB
         if (that.indexOf(e) + them.indexOf(e) > -2) {
            that.deleteAll(e)
            them.deleteAll(e) } })
      return this }
   Array.prototype.union = function(){ /* NYI */ }
   Array.prototype.deleteAll = function(element){ var i
      while ((i = this.indexOf(element)) !== -1)
         delete this[i] }
   
   /* Debugging
   // ========= */
   P = function P(it) {return (log.element||noop).call(log,
      it instanceof Thing? Thing.prototype.inspect.apply(it)
    : (it? it.toString() : ANSI.red('null')) )}
   I = function I(it) { var a, b, tag
      if (!(it instanceof Thing)) return (it?
         (it.inspect? it.inspect:it.toString).call(it) : ANSI.red('null') )
      if (/\n/.test(a = it.inspect()) && log.element) { tag = Thing.inspect(it, true)
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
         
         console.log(ANSI.SGR(40)+before+output+' '+ANSI.SGR(49) )
         elements.forEach(function(e){e.forEach(function(e){
            console.log(ANSI.SGR(40)
            +(e[0]+e[1]).split("\n").map(function(l){
               return new Array(ANSI.strip(e[0]).length+indent).join(' ')+l+' '
            }).join("\n").slice(ANSI.strip(e[0]).length)+' '+ANSI.SGR(49)) })})
         
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
   

/* =  - -===-=-== == =-=-= --=- =- =--   =-- =-====-  -==--= =- -   -=-== = --  - =---=-==  -= -= */
if (require.main === module)
~function(){ var testing = new Object, Battery, $,Check, pending
   /* Testing-related plumbing
   // ======================== */
   // The following constructs a stupid little testing ‘framework,’ if one can even glorify it with
   // that name, that I then use to directly exercise several of the above tools.
   // Hacky as fuck? Yes.
   /* Effective? Also yes.                                                       */testing.Battery =
   Battery = function(battery){ var it = construct(this)
          it.elements = new Array()
      if (it.ancestor = Battery.current)
          it.ancestor.elements.push(it)
                          Battery.current = it
                          battery.call()
                          Battery.current = it.ancestor }
   Battery.prototype.
   execute = function(n){ var n = n || 0
      stats = this.elements.reduce(function(acc, element){
         return testing.addStats(element.execute(n + 1), acc) }, Check.pristine)
      testing.log(n, testing.inspectStats(stats) )
      return stats }
                                                                                     testing.Check =
   Check = $ = function(target){ ;debugger;var it = construct(this)
      if ( it.battery = Battery.current )
           it.battery.elements.push(it)
           it.target = target || undefined
           it.expectations = Array.prototype.splice.call(arguments, 1)
      return function(expectation, rest){
         if (typeof expectation === 'string') expectation =
            eval('(function('+expectation+'){ return '+expectation+rest+' })')
         it.expectations.push(expectation)
         if (!it.battery)
            testing.log(0, testing.inspectStats(it.execute(expectation)))
         return arguments.callee } }
   
   Check.pristine = [0,0,0]                                                               ;pending =
   Check.pending = 'pending'
   
   Check.prototype.
   execute = function(n, expectation){ var
      target = this.target && this.target.call instanceof Function && this.target.length === 0 ?
                  this.target.call() : this.target
      return (expectation? [expectation] : this.expectations).reduce(function(acc, expectation){ var
         result = expectation.call(target, target)
         testing.log(n, ANSI[result === Check.pending? 'yellow' : result? 'green' : 'red']
                           (' '+expectation.toString().replace('function ','      ->')) )
         return testing.addStats(
            result === Check.pending? [0,1,0]
          : result?                   [1,0,0]
          :                           [0,0,1]
          , acc) }, Check.pristine) }
   
   testing.log = function(n, string, max){ max = max || 100; console.log(
      // This monstrosity splits a string into lines, and further splits any lines over `max`
      // characters (ignoring ANSI SGR escapes specifically) into multiple lines; then indents.
      string.split(new RegExp(
         '((?:(?:\033\\[[\\d;]+m)?[^\\n]){0,'+((max-2*n)-1)+'}(?=\\n|$)|(?:(?:\033\\[[\\d;]+m)?[^\\n]){'+(max-3*n)+'})' ))
      .filter(function(_, i){ return i % 2 }) .join("\n")
      .replace(/(^|\n)/g, '$1'+new Array(n+1).join('   ')) )}
   testing.inspectStats = function(s,p,f){ if (s instanceof Array) { f=s[2]; p=s[1]; s=s[0] }
      return ANSI[f? 'red' : p? 'yellow' : 'green']( (s+p) +' of '+ (s+p+f) )
           + (p? ' '+ ANSI.yellow('('+ p + ' pending)') : '') }
   testing.addStats = function(a, b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]] }
   
new Battery(function(){

/* Parsing tests
// ============= */
new Battery(function(){

var expr1 = new Expression, expr2 = new Expression, expr3 = new Expression
new Check()
(function(){        expr1  .append(expr2)
             return expr1.next === expr2 })
(function(){        expr1  .append(expr3)
             return expr1.next === expr2 })
(function(){ return expr1.next === expr2 })

new Check(  cPaws.parse('')  )
(function(locals){ return typeof locals.contents === 'undefined' })

var some_string = 'µPaws'
new Check(  cPaws.parse(some_string) .next  )
(function(label_node){ return label_node.contents instanceof Label })
(function(label_node){ return label_node.contents.string === some_string })

new Check(  cPaws.parse(some_string +' '+ some_string)  )
(function(root){ return root.next     .contents instanceof Label })
(function(root){ return root.next     .contents.string === some_string })
(function(root){ return root.next.next.contents instanceof Label })
(function(root){ return root.next.next.contents.string === some_string })

new Check(  cPaws.parse('('+ some_string +')')  )
(function(locals){ return typeof locals.contents === 'undefined' })
(function(node)  { return node.next instanceof Expression })
(function(node)  {           var inner_locals = node.next.contents
                   return typeof inner_locals.contents === 'undefined' })
(function(node)  {           var inner_locals = node.next.contents
                               , inner_label  = inner_locals.next
                          return inner_label.contents instanceof Label })

new Check(  cPaws.parse('{}') .next  )
(function(scope){ return scope.contents instanceof Execution })

var scope = cPaws.parse('{' + some_string + '}')
new Check(  scope .next .contents  )
(function(execution){ return !execution.complete() })


var execution = scope.next.contents
new Check(  execution .position  )
(function(locals){ return typeof locals.contents === 'undefined' })

new Check(  execution .position .next  )
(function(label_node){ return label_node.contents instanceof Label })
(function(label_node){ return label_node.contents.string === some_string })

})
/* Advancement tests
// ================= */
new Battery(function(){

var func1 = new Function(), func2 = new Function()
new Check(  new Execution(func1, func2)  )
(function(alien){ return  alien.pristine && !alien.complete() })
(function(alien){ return  alien.subs.length === 2 })

(function(alien){ return  alien.advance() === func1 })
(function(alien){ return !alien.pristine })
(function(alien){ return  alien.subs.length === 1 })

(function(alien){ return  alien.advance() === func2 })
(function(alien){ return  alien.complete() })

new Check(  new Execution(cPaws.parse(''))  )
(function(native){ return 'pending'; return  native.pristine })
(function(native){ return 'pending'; return  native.complete() })
(function(native){ return 'pending'; return typeof native.advance() === 'undefined' })

var some_string = 'µPaws'
~function(){
var  a_native = new Execution(cPaws.parse(some_string))
,      locals = a_native.position
,  some_label = locals.next.contents

new Check(  a_native  )
(function(native){ return  native.pristine
                       && !native.complete() })
(function(native){ var juxt = native.advance()
         return typeof juxt.left === 'undefined'
                    && juxt.right === some_label })
(function(native){ return !native.pristine
                       &&  native.complete() })
(function(native){ return typeof native.advance() === 'undefined' })
}()

~function(){
var      a_native = new Execution(cPaws.parse(some_string +' '+ some_string))
,          locals = a_native.position
,     first_label = locals.next.contents
,    second_label = locals.next.next.contents
, arbitrary_thing = new Thing()

new Check(  a_native  )
(function(native){ return  native.pristine
                       && !native.complete() })
(function(native){ var juxt = native.advance()
         return typeof juxt.left === 'undefined'
                    && juxt.right === first_label })
(function(native){ return !native.pristine })
(function(native){ var juxt = native.advance(arbitrary_thing)
                return juxt.left === arbitrary_thing
                    && juxt.right === second_label })
(function(native){ return  native.complete() })
(function(native){ return typeof native.advance() === 'undefined' })
}()

~function(){
var      a_native = new Execution(cPaws.parse('('+ some_string +')'))
,          locals = a_native.position
,    inner_locals =       locals.next.contents
,      some_label = inner_locals.next.contents
, arbitrary_thing = new Thing()

new Check(  a_native  )
(function(native){ return  native.pristine
                       && !native.complete() })
(function(native){ var juxt = native.advance()
         return typeof juxt.left === 'undefined'
                    && juxt.right === some_label })
(function(native){ return !native.pristine })
(function(native){ var juxt = native.advance(arbitrary_thing)
         return typeof juxt.left === 'undefined'
                    && juxt.right === arbitrary_thing })
(function(native){ return  native.complete() })
(function(native){ return typeof native.advance() === 'undefined' })
}()


})

}).execute() }()

if(module)module.exports=paws
