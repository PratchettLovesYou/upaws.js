#!/usr/bin/env node
var /* Types: */           Thing, R,Relation, Label, Execution                                                    //|   // Code over here, beyond column 117, is not intended for the consumption of casual readers.
  , /* Parsing: */         cPaws, Expression                                                                      /*|*/;var undefined, u
  , /* Staging queue: */   Mask, World, Staging, metadataReceiver, executionReceiver
  , /* Aliens: */          ǁ,infrastructure, implementation, parseNum
  , /* Plumbing: */        inherits, construct, define, getter, chainee, noop
  , /* Debugging: */       P,I, D,debug, log, ANSI
   
  , USE_COLOR      = process.env['USE_COLOR'] === 'false' || true
  , DEBUG = parseInt(process.env['DEBUG'])
  , DEBUG = DEBUG === 0? 0:(DEBUG || 6)
   
  , fs   = require('fs')
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
   
   // TODO: Refactor *all* of this crap.
   Thing.prototype.toString = function(){ return this.named? this.name:'' }
   Thing.prototype.inspect = function _inspect(){ var indent = 0
      return function $$(it, i, seen, split){ var content, lines, old_seen = seen.slice()
         if (!it) return ''
         if (!split && seen.indexOf(it) >= 0)
            return Thing.inspectID(it)+it.toString()+ANSI.brwhite('...'); else seen.push(it)
         if (it.constructor !== Thing && $$.caller !== _inspect)
            return it.toString()
         
         if (it.metadata.length === 3
         &&  it.metadata[1] && it.metadata[1].to instanceof Label
         &&  it.metadata[2])
                content = ANSI.cyan(it.metadata[1].to.string+': ')
                        + $$(it.metadata[2].to, ++i, seen)
         else { content = Thing.inspectID(it)+ANSI.brwhite('(')
                        + it.toArray().map(function(thing){ return $$(thing, ++i, seen) })
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
   
   Relation.prototype.clone = function(){ return new Relation(this.to, this.isResponsible) }
   
   chainee(Relation.prototype, 'responsible',   function(){ this.isResponsible = true })
   chainee(Relation.prototype, 'irresponsible', function(){ this.isResponsible = false })
   getter(Thing.prototype,     'responsible',   function(){ return R(this).responsible })
   getter(Thing.prototype,     'irresponsible', function(){ return R(this).irresponsible })
   
   Thing.prototype.clone = function(to){ var to = to || new Thing()
      if (it.constructor.parent)
          it.constructor.parent.prototype.clone.call(this, to)
      to.metadata = this.metadata.map(function(rel){ return rel? rel.clone() : rel })
      return it }
   
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
         default:       return Object.keys(that).map(function(key){ var
                           pair = new Thing(new Label(key).responsible) // May be redundant
                           pair.push.apply(pair, Thing.toRelations(that[key], resp, seen))
                           return pair.responsible }) } }()]) && seen.last
      return result[1] }
   
   Thing.prototype.push = function(){ this.metadata
    = this.metadata.concat(Thing.toRelations([].slice.apply(arguments))) }
   
   Thing.prototype.compare = function(right){ return this === right }
   
   Thing.prototype.find = function(key){
      return this.metadata.slice().reverse().map(function(rel){
         return rel && rel.to instanceof Thing
             && rel.to.metadata[1] && rel.to.metadata[2]
             && rel.to.metadata[1].to.compare(key)?
                                      rel.to.metadata[2].to : undefined })
            .filter(function(_){return _}) }
                                                                                        paws.Label =
   Label = function(string){ var it = construct(this)
      it.string = string || undefined
      return it }
   inherits(Thing, Label)
   Label.prototype.toString = function(){ return ANSI.cyan("'"+this.string+"'") }
   
   Label.prototype.clone = function(to){ var to = to || new Label('')
      if (it.constructor.parent)
          it.constructor.parent.prototype.clone.call(this, to)
      to.string = this.string
      return it }
   
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
         it.locals = new Thing().name('locals')
         it.locals.push({locals: R(it.locals, true)}) }
         it       .push({locals: R(it.locals, true)})
      
      if (original && original.hasOwnProperty('name'))
         it.name = original.name + '′'
      return it }
   inherits(Thing, Execution)
   Execution.prototype.receiver = /* defined below */                                                             /*|*/ undefined
   
   Execution.synchronous = function(func){ var it = new Execution(new Function)
    , arity = func.length - 1
      
      it.subs = new Array(arity).join().split(',').map(function(){
         return function(caller, rv, here){
            this.subs.last = this.subs.last.curry(rv)
            here.queue.push(new Staging(caller, this))
            here.realize() } })
      
      it.subs.first = function(caller, here){ var that = this
         that.subs = that.subs.map(function(sub){ return sub.curry(caller) })
         here.queue.push(new Staging(caller, that))
         here.realize() }
      
      it.subs[arity] = Function.apply(null, ['paws', 'func', 'caller'].concat(
         Array(arity + 1).join('_').split(''), 'here',                                          "\n"
          +"var rv = func.apply(this, [].slice.call(arguments, 3))"                            +"\n"
          +"if (typeof rv !== 'undefined') {"                                                  +"\n"
          +"   here.queue.push(new paws.Staging(caller, rv))"                                  +"\n"
          +"   here.realize() }"))
      .curry(paws, func)
      
      return it }
      
   
   Execution.prototype.toString = function toString() { return this.alien
    ? ANSI.brmagenta(this.named? '´'+this.name+'´' : '´anon´')
    : ANSI.brmagenta(this.named? '`'+this.name+'`' : '`anon`') }
   Execution.prototype.inspect = function() { var rv = new Array
     !this.alien && this.stack.length > 0 && rv.push(ANSI.brblack('stack:    ')
       + ANSI.brwhite('[') + this.stack.map('.value'._).reverse().map('.toString()'._)
               .join(ANSI.brwhite(', ')) + ANSI.brwhite(']'))
     !this.alien && rv.push('position: '
       + (this.position? this.position.inspect()
                       : Expression.prototype.inspect.call({genesis: this.genesis})))
      this.alien && rv.push('subs: '+this.subs.length)
      rv.push('locals:   '+this.locals.inspect())
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
   cPaws.labelCharacters = /[^(){} \n]/ // Not currently supporting quote-delimited labels
   
   cPaws.
   parse = function(text){ var i = 0
    , genesis = function(result, a, z){ result.genesis =
       { original: text
       , index: [a, z]
       , string: text.slice(a, z) }
         return result }
      
    , character = function(c){ return text[i] === c && ++i }
    , whitespace = function(){ while (character(' ')||character("\n")); return true }
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
   Thing.prototype.receiver = new Execution(function(rv, $){ var arguments = rv.toArray()
    , results = arguments[1].find(arguments[2])
      if (results[0]) {
         $.queue.push(new Staging(arguments[0], results[0]))
         $.realize() } })
   .name('thing×')
   
   Execution.prototype.receiver = new Execution(function(rv, $){ var arguments = rv.toArray()
      $.queue.push(new Staging(new Execution(arguments[1]), arguments[2]))
      $.realize() })
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
      it.queue = [/* Staging */]
      it.ownershipTable = { blamees: [/* execution */]
                          , masks:   [/* Mask */] }
      
      return it }
   
   // Non-concurrent implementation! Yay! </sarcasm>
   World.current = undefined
   World.prototype.count = 0
   
   World.prototype.next = function(){ var table = this.ownershipTable
      // We look for the foremost element of the queue that either:
      // 1. isn’t already staged (inapplicable to this implementation),
      // 2. doesn’t have an associated `requestedMask`,
      // 3. is already responsible for a mask equivalent to the one requested,
      // 4. or whose requested mask doesn’t conflict with any existing ones, excluding its own
      for (var i = 0; i < this.queue.length; ++i) { var it = this.queue[i]
         alreadyResponsible = function(){
            return table.masks
               .filter(function(mask, j){ return table.blamees[j] === it.stagee })
                 .some(function(mask)   { return mask.contains(it.requestedMask)              }) }
       , requestConflicts = function(){
            return table.masks
               .filter(function(mask, j){ return table.blamees[j] !== it.stagee })
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
   
   World.prototype.recordOwnership = function(blamee, requestedMask){ if (requestedMask) {
      this.ownershipTable.blamees.push(blamee)
      this.ownershipTable.masks.push(requestedMask) }}
   World.prototype.invalidateRoots = function(blamee){ var roots = [].slice.apply(arguments)
    , blamee = roots.shift()
    , table = this.ownershipTable
      table.blamees.forEach(function(it, i){
         if (it === blamee) {
                table.masks[i].roots.intersect(roots)
            if (table.masks[i].roots.length == 0) {
                table.blamees.splice(i,1)
                table.masks  .splice(i,1) }} }) }
   
   World.prototype.realize = function(){ var here = this, st, jx, rv, receiver
      ++here.count
      
      if (World.current) return
          World.current = here
      
      do (function(){
      
         if (!( st = here.next()         )) return
         if (        st.stagee.complete() ) return
         if (!( jx = st.stagee.advance(st.resumptionValue) )) return
         
         debug(7, '>> ')(new Error().stack.split("\n").length-2+'/'+here.count
                       , 'stagee: '+I(st.stagee)
                       , 'resumptionValue: '+I(st.resumptionValue))
         
         here.recordOwnership(st.stagee, st.requestedMask)
         
         if (st.stagee.alien)
            return jx.call(st.stagee, st.resumptionValue, here)
         
         rv = new Thing; rv.push(jx.context, jx.left, jx.right)
         here.queue.push(new Staging(new Execution(jx.left.receiver), rv))
         ++here.count
         
         if (st.stagee.complete())
            here.invalidateRoots(st.stagee)
         
      }())
      while (--here.count)
      
      delete here.occupant
      delete World.current }
         
   
   World.prototype.intervalID = 0
   World.prototype.interval = 50
   
   World.prototype.
   start = function(){
      if (!this.intervalID)
           this.intervalID = setInterval(this.realize.bind(this)
                                       , World.prototype.interval) }                                              /*|*/;World.prototype.
   stop  = function(){
      if ( this.intervalID)
           this.intervalID = clearInterval(this.intervalID) }
   
   World.prototype.ownBag = function(bag){ here = this
      return bag
        .filter(function(el, key){ return key.charAt(0) != '_' })
        .map(function $$(el){ if (el) switch(el.constructor){
            case Function: return el.curry(here)
            case Thing: case Label: case Execution:
               case Relation: return el
            case Object:   return el.map($$) }}) }
   
   World.prototype.applyGlobals = function(root){ var here = this
      function $$(el, key){ if (el) switch(el.constructor){
         case Function: return Execution.synchronous(el).name(key)
         case Label: case Execution:
            case Thing: return (el.named? el : el.name(key)).irresponsible
         case Relation: return el
         case Object:   return new Thing(el.map($$)).responsible }} 
      root.locals.push({
         infrastructure: new Thing( paws.infrastructure.map($$) ).name('infrastructure')
       , implementation: new Thing( paws.implementation.map($$) ).name('implementation')          }) }
   
   /* Alien families
   // ============== */                                                        paws.infrastructure =
   infrastructure = {
      get:        function(thing, num ,_){ return thing.metadata[parseNum(num)].to }
//  , find:       function(thing, key ,_){ return thing.find(key)[0] } // NYI: need a fromArray()
    , set:        function(thing, num, it ,_){    thing.metadata[parseNum(num)] = Relation(it) }
    , cut:        function(thing, num ,_){ return thing.metadata.splice(parseNum(num), 1)[0].to }
      
    , affix:      function(thing, it ,_){         thing.metadata.push(Relation(it)) }
    , unaffix:    function(thing ,_){      return thing.metadata.pop().to }
    , prefix:     function(thing, it ,_){         thing.metadata.unshift(Relation(it)) }
    , unprefix:   function(thing ,_){      return thing.metadata.shift().to }
      
    , compare:    function(first, second ,_){
         return first === second? first : undefined }
      
    , clone:      function(thing ,_){      return Thing.prototype.clone.call(thing) }
    , adopt:      function(thing, adoptee ,_){    thing.metadata = adoptee.metadata.clone().slice() }
      
    , receiver:   function(thing ,_){      return thing.receiver }
    , receive:    function(thing, execution ,_){  thing.receiver = execution }
      
    , charge:     function(thing, num ,_){        thing.metadata[parseNum(num)].isResponsible = true }
    , discharge:  function(thing, num ,_){        thing.metadata[parseNum(num)].isResponsible = false }
      
    , label: {
         clone:      function(label ,_){         return Label.prototype.clone.call(label) }
       , compare:    function(first, second ,_){
            return first.string == second.string? first : undefined }
         
       , explode:    function(label ,_){ var
            it = new Thing
            it.push.apply(it, label.split('').map(function(char){ return new Label(char) }))
            return it }                                                                            }
      
    , execution: {
         branch:     function(execution ,_){ return new Execution(execution) }
         
       , stage:      function(execution, resumptionValue, here){
            here.queue.push(new Staging(execution, resumptionValue))
            here.realize()
            return execution }
       , unstage:    function(_){}                                                                 
         
       , charge:     function(_){} // NYI
       , discharge:  function(_){} // NYI
   }}
                                                                               paws.implementation =
   implementation = {
      stop:       Execution(function(_,here){ here.stop() }) // Not sure I'll keep this ...
    , util: {
         test:    Execution(function(){ console.log('test successful!') })
       , print:   Execution(function(label){ console.log(label.string) })
       , inspect: Execution(function(thing){ console.log(thing.inspect()) })
      }
    , void: Execution(function(caller, here){ return function void_(_,here){
         here.queue.push(new Staging(caller, Execution(void_)))
         here.realize() }(_,here) })                                                               }
   
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
   
   define(Array.prototype, 'zip', function(cb){ var that = this
    , arrays = [].slice.apply(arguments)
      cb = typeof arrays.last == 'function'? arrays.pop()
         : function(){ return [].slice.apply(arguments) }
      arrays.unshift(this)
      return this.map(function(_, i){ return cb.apply(that
       , arrays.map(function(array){ return array[i] })) }) })
   define(Array.prototype, 'equals', function(other){
      return this.zip(other, function(a, b){ return a === b }).every(noop) })
   
   define(String.prototype, 'toFunction', function(){
      arguments = [].slice.apply(arguments.length? arguments:['it'])
      return global.eval('(function('+arguments.join(', ')+'){ return '+arguments[0]+this+' })') })
   
   define(Object.prototype, 'filter', function(cb){ var that = this
      return Object.keys(that).reduce(function(acc, key){
         if ( cb.call(that, that[key], key, that) )
            acc[key] = that[key]
         return acc }, new Object) })
   define(Object.prototype, 'map',    function(cb){ var that = this
      return Object.keys(that).reduce(function(acc, key){
         acc[key] = cb.call(that, that[key], key, that)
         return acc }, new Object) })
   define(Object.prototype, 'reduce', function(cb, initial){ var that = this
      return Object.keys(that).reduce(function(acc, key){
         return cb.call(that, acc, that[key], key, that) }, initial) })
   
   getter(Object.prototype, '‽', function(){ console.log(require('sys').inspect(this)); return this })
   getter(Object.prototype, '_', function(){ return this.toFunction? this.toFunction() : this })
   
   define(Function.prototype, 'calledBy', function(other, seen){ (seen = seen || []).push(this)
      if (seen.include(this.caller)) return false
      return !!this.caller && (this.caller === other || this.caller.calledBy(other, seen)) })
   
   // Would prefer to use an actual Function-subclass a lá `from`, so that I don't have to manually
   // attach a .toString() to each instance; but this will do for the moment.
   // FIXME: Will currently error out if you curry in more arguments than the function needs
   define(Function.prototype, 'curry', function(){ var that = this
    ,   curried = [].slice.call(arguments)
    , uncurried = Array(++that.length - curried.length).join('_').split('')
      
    , eval = GLOBAL.eval // Must be referenced as `eval` <http://es5.github.com/#x15.1.2.1.1>
    , result = eval("(function("+uncurried.join(', ')+"){"
       +"return that.apply(typeof bound === 'object'"                                         +"\n"
       +"               || typeof bound === 'function'? bound:this"                           +"\n"
       +"                   , curried.concat([].slice.call(arguments))) })"                   +"\n")
      
      result.toString = that.toString.bind(that)
      result.final = that.final || that
      return result })
   
   /* Debugging
   // ========= */
   P = function P(it) {return (log.element||noop).call(log,
      it instanceof Thing? Thing.prototype.inspect.apply(it)
    : (it? it.toString() : ANSI.red('null')) )}
   I = function I(it) { var a, b, tag
      if (!(it instanceof Thing)) return (it?
         (it.inspect? it.inspect:it.toString).call(it) : ANSI.red('null') )
      if (log.element && (/\n/.test(a = it.inspect()) || ANSI.strip(a).length >= 60)) { tag = Thing.inspectID(it)
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
// if (DEBUG >= 7) // This is about as robust as ... something not-very-robust. lolwhatever.
// ~function __identifier__(o, seen){ if (seen.indexOf(o) >= 0) return; seen.push(o)
//    Object.getOwnPropertyNames(o).forEach(function(key){
//       try { __identifier__(o[key], seen) } catch(_){}
//       try { if (typeof o[key] == 'function' || o.__proto__ === Object.prototype)
//          o[key].__identifier__ = key } catch(_){} })
//    }(paws, [])
   
// TODO: needs to count parens, and concat multiple-lines
// TODO: needs to automatically inspect results (hence rePl.)
   paws.REPL = function(here){ var sharedLocals, shortcircuit, mutex, expression, resumption
    , read = require('readline').createInterface({ input: process.stdin, output: process.stdout })
      read.setPrompt(':: ')
      
      process.title = 'µPaws.js REPL' // No-op on OS X, as of Node v0.8.16 #fuckmesideways
      
      console.log("Successive lines will be parsed as individual executions, with shared locals.")
      console.log("  (make sure you understand the basics: `less Getting.Started.*`)")
      console.log("  (⌃d to close the input-stream; ⌃c to synchronously force new input)")
      read.prompt()
      
      sharedLocals = new Execution(new Function)
      here.applyGlobals(sharedLocals)
      sharedLocals = sharedLocals.locals
      
      read.on('line', function(line){ if (shortcircuit) return shortcircuit = false
         read.pause()
         
         if (line.length > 0) try {
            mutex = new Thing
            expression = new Expression(paws.implementation.util.inspect)
            expression.append(new Expression(cPaws.parse(line)))
            expression = new Execution(expression).name('<interactive line>')
            expression.locals = sharedLocals
            resumption = new Execution(function(){
               mutex = undefined
               read.prompt()
            }).name('<resume prompt>')
            
         // TODO: convenience for world.queue.push, new Mask, realize() pattern
            here.queue.push(new Staging(expression ,u, new Mask(expression, [mutex])))
            here.realize()
            
            here.queue.push(new Staging(resumption ,u, new Mask(resumption, [mutex])))
            here.realize()
         } catch(e) {
            console.log(e.message); console.log(e.stack)
            read.prompt() }
         
         else read.prompt() })
      
      var SIGINT  = function(){ process.nextTick(function(){
         if (mutex) here.invalidateRoots(expression, mutex)
             else {
               shortcircuit = true // horrible hack.
               read.write('\n')
               read.prompt() } }) }
      read   .on('SIGINT', SIGINT)
      process.on('SIGINT', SIGINT)
      
      var SIGTERM = function(){
         here.stop()
         read.write("\033[2K\033[0G")
         process.stdin.destroy() }
      read   .on('close',   SIGTERM)
      process.on('SIGTERM', SIGTERM) }

if(module)module.exports=paws

/* =  - -===-=-== == =-=-= --=- =- =--   =-- =-====-  -==--= =- -   -=-== = --  - =---=-==  -= -= */
if (require.main === module && process.argv.length > 2) ~function(){ var
   opt = require('optimist')
      .usage("Provides a Paws ‘Layer 1’ host.\nInvocation: $0 [--no-start] -f foo.cp -f bar.cp")
         .describe('start', "start the host")
            .alias('start', 's').boolean('start').default('start', true)
         .describe('f', "adds a file of cPaws source to be realized by the host")
            .alias('f', 'file').string('f')
         .describe('e', "directly adds a cPaws expression to be realized by the host")
            .alias('e', 'expr').string('e')
         .describe('i', "interactively prompt for expressions to realize")
            .alias('i', 'interactive').boolean('i')
         .boolean('help')
   
 , argv = opt.parse(process.argv)
 , files = [].concat(argv.f).filter(noop).map(function(file){
      return fs.readFileSync(file, 'utf8').replace(/^#!.*\n/, '') })
   
 , earth = new World
   
 , roots = [].concat(argv.e, files).filter(noop).map(function(root){
         root = new Execution(cPaws.parse(root))
         earth.applyGlobals(root)
         return root })
   
   if (argv.help || argv.usage)
      opt.showHelp()
   if (argv.start || typeof argv.start == 'undefined') // FIXME: Optimist is being a retard ...
      earth.start()
   
   roots.forEach(function(root){
      earth.queue.push(new Staging(root, null))
      earth.realize() })
   
   if (argv.i)
      paws.REPL(earth)
}()
