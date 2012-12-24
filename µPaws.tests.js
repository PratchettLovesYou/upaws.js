// This file is to be concatenated to µPaws.js and then executed.

// In zsh:
// 
//     node =(cat µPaws{,.tests}.js)

if (require.main === module)
~function(){ var testing = new Object, Battery, $,Check, pending, broken
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
   Check = $ = function(target){ var rv, it = construct(this)
      if ( it.battery = Battery.current )
           it.battery.elements.push(it)
           it.target = target || undefined
           it.expectations = Array.prototype.splice.call(arguments, 1)
      rv = function(expectation, rest){
         if (typeof expectation !== 'function') expectation = rest.toFunction(expectation)
         it.expectations.push(expectation)
         if (!it.battery)
            testing.log(0, testing.inspectStats(it.execute(expectation)))
         return arguments.callee }
      Object.getOwnPropertyNames(Check.prototype).forEach(function(key){
         rv[key] = Check.prototype[key].bind(it) }); return rv }
   
   Check.prototype.drill = function(to){
      if (typeof to !== 'function') to = to.toFunction()
      return new Check(to.bind(null, this.target)) }
   
   Check.pristine = [0,0,0]                                                               ;pending =
   Check.pending = 'pending'                                                               ;broken =
   Check.broken  = 'broken'
   
   Check.prototype.
   execute = function(n, expectation){ var it = this
      if (it.target && it.target.call instanceof Function && it.target.length === 0)
          it.target = it.target.call()
      return (expectation? [expectation] : it.expectations).reduce(function(acc, expectation){ var
         result = expectation.call(it.target, it.target)
         testing.log(n, ANSI[result === Check.pending? 'yellow'
                           : result === Check.broken?  'brred'
                                             : result? 'green' : 'red']
                           (' '+expectation.toString().replace('function ','      ->')) )
         return testing.addStats(
            result === Check.pending? [0,1,0]
          : result === Check.broken?  [0,0,1]
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

/* Datatype tests
// ============== */
new Battery(function(){

$(  new Thing  )
('empty','.id > 0')
('empty','.metadata.length === 0')

var something = new Thing, something_else = new Thing
$(  new Thing  )
(function(thing){        thing.push(something, something_else)
                  return thing.metadata.length === 2 })
(function(thing){ return thing.metadata[0] instanceof Relation })
(function(thing){ return thing.metadata[0].to === something })
(function(thing){ return!thing.metadata[0].isResponsible })
(function(thing){ return thing.metadata[1] instanceof Relation })
(function(thing){ return thing.metadata[1].to === something_else })
(function(thing){ return!thing.metadata[1].isResponsible })
$(  new Thing  )
(function(thing){        thing.push(new Relation(something, true))
                  return thing.metadata.length === 1 })
.drill('.metadata[0]')
(function(first){ return first instanceof Relation })
(function(first){ return first.to === something })
        ('first',            '.isResponsible')

var check =
$(  new Thing  )
(function(thing){        thing.push({foo: something, bar: something_else})
                  return thing.metadata.length === 2 })
(function(thing){ return thing.metadata[0] instanceof Relation
                      && thing.metadata[0].isResponsible })
(function(thing){ return thing.metadata[1] instanceof Relation
                      && thing.metadata[1].isResponsible })

check.drill('.metadata[0].to')
(function(first){ return first.metadata[1] instanceof Relation
                      && first.metadata[1].isResponsible
                      && first.metadata[1].to instanceof Label
                      && first.metadata[1].to.string === 'foo' })
(function(first){ return first.metadata[2] instanceof Relation
                      &&!first.metadata[2].isResponsible
                      && first.metadata[2].to === something })

check.drill('.metadata[1].to')
(function(second){ return second.metadata[1] instanceof Relation
                       && second.metadata[1].isResponsible
                       && second.metadata[1].to instanceof Label
                       && second.metadata[1].to.string === 'bar' })
(function(second){ return second.metadata[2] instanceof Relation
                       &&!second.metadata[2].isResponsible
                       && second.metadata[2].to === something_else })

$(  new Thing({ foo: something, bar: something_else })  )
(function(person){ return person.find(new Label('foo'))[0] === something })
(function(person){ return person.find(new Label('bar'))[0] === something_else })

$(  new Thing(new Thing(something, something_else))  )
(function(thing){ return thing.find(something)[0] === something_else })

})
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

var func1 = new Function, func2 = new Function
new Check(  new Execution(func1, func2)  )
(function(alien){ return alien.pristine && !alien.complete() })
(function(alien){ return alien.subs.length === 2 })

                         // FIXME: I can't figure out how to access the pre-bind() `Function`!
(function(alien){ return alien.advance(), pending;
                  return alien.advance() === func1 })
(function(alien){ return!alien.pristine })
(function(alien){ return alien.subs.length === 1 })

(function(alien){ return alien.advance(), pending;
                  return alien.advance() === func2 })
(function(alien){ return alien.complete() })

var earth      = new World
  , fun        = function(a, b, c){ return new Thing(a, b, c) }
  , caller     = new Execution(new Function)
  , parameters = {one: new Thing, two: new Thing, three: new Thing}
  , sub1, sub2
new Check(  new Execution.synchronous(earth, fun)  )
(function(synch){ return synch.subs.length == 4 })
(function(synch){ return synch.subs.last.length == 4 })
(function(synch){        synch.advance()(caller)
                  return synch.subs.length == 3
                      && synch.subs.last.length == 3 })
(function(synch){        synch.advance()(parameters.one)
                  return synch.subs.length == 2
                      && synch.subs.last.length == 2 })
(function(synch){        synch.advance()(parameters.two)
                  return synch.subs.length == 1
                      && synch.subs.last.length == 1 })
(function(synch){        synch.advance()(parameters.three)
                     var staging = earth.queue.pop()
                  return synch.subs.length == 0
                      && staging.stagee === caller
                      && staging.resumptionValue
                      && staging.resumptionValue.toArray()
                        .equals([u,parameters.one, parameters.two, parameters.three]) })

new Check(  new Execution(cPaws.parse(''))  )
(function(native){ return pending; return  native.pristine })
(function(native){ return pending; return  native.complete() })
(function(native){ return pending; return typeof native.advance() === 'undefined' })

var some_string = 'µPaws'
~function(){
var  a_native = new Execution(cPaws.parse(some_string))
,      locals = a_native.position
,  some_label = locals.next.contents

new Check(  a_native  )
(function(native){ return  native.pristine
                       && !native.complete() })
(function(native){ var juxt = native.advance()
                return juxt.left === native.locals
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
                return juxt.left === native.locals
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
                return juxt.left === native.locals
                    && juxt.right === some_label })
(function(native){ return !native.pristine })
(function(native){ var juxt = native.advance(arbitrary_thing)
         return typeof juxt.left === 'undefined'
                    && juxt.right === arbitrary_thing })
(function(native){ return typeof native.advance() === 'undefined' })
}()


})
/* Plumbing tests
// ============== */
new Battery(function(){

var
c = new Check(  ['one', 'two', 'three'].zip([1, 2], 'abcd'.split(''))  )
c.drill('[0]')('a',"[0] === 'one'   && a[1] === 1 && a[2] === 'a'")
c.drill('[1]')('b',"[0] === 'two'   && b[1] === 2 && b[2] === 'b'")
c.drill('[2]')('c',"[0] === 'three' && typeof c[1] === 'undefined' && c[2] === 'c'")

new Check(  'abcd'.split('').zip('1234'.split('')
          , function(letter, number){ return letter + number })  )
('it',".join('') === 'a1b2c3d4'")

new Check(  ['one', 2, 'c']  )
(function(arr){ return arr.equals(['one', 2, 'c']) })
(function(arr){ return!arr.equals(['one', 3, 'c']) })

~function(){
var a_function = function(a,b,c,d,e,f,g,h){
   return {this: this, arguments: [].slice.call(arguments)} }
  , something = new Object
  , arb1 = new Object
  , arb2 = new Object

  , first = a_function.curry('one', 'two', 'three')
new Check(  first  )
                      ('curried','.length == 5')
(function(curried){ return typeof curried === 'function' })
(function(curried){ return curried.final      === a_function })
(function(curried){ return curried.toString() === a_function.toString() })
(function(curried){ var res = curried('four', 'five')
                 return res.arguments.equals(['one', 'two', 'three', 'four', 'five'])
                     && res.this === GLOBAL })

var bound1 = first.bind(arb1)
new Check(  bound1  )
(function(bound){ var res = bound('four', 'five')
               return res.this === arb1 })

// FIXME: Should bound-functions through curry() maintain the toString() and final?
var second = bound1.curry(something)
new Check(  second  )
(function(curried){ return typeof curried === 'function' })
(function(curried){ return curried.final      === bound1 })
(function(curried){ return curried.toString() === bound1.toString() })
(function(curried){ var res = curried(4, 5); debugger;
                 return res.arguments.equals(['one', 'two', 'three', something, 4, 5])
                     && res.this === arb1 })

var bound2 = second.bind(arb2)
new Check(  bound2  )
(function(bound){ var res = bound('four', 'five')
               return res.this === arb1 })
}()

})

}).execute() }()
