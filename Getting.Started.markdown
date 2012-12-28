Getting Started
---------------
This document covers some really bare-bones Paws ‘basic’ ... only enough to allow you to use the
REPL provided in this package. No more. Don't expect to come out of this “knowing Paws”; rather,
expect to be able to type some things into the REPL, and for those things to do something rather
obvious. Neither expect to fully understand *how* those things you typed do what they do.

> For a more specific, but less ‘documentation-y,’ introduction to the concepts behind Paws (or
> rather, behind “Paws' Nucleus,” which is what you're looking at), you can read the chat-log of a
> conversation I had with [@arplynn](http://twitter.com/arplynn) in our IRC room, in which I
> thoroughly explain the core concepts behind the language:
> 
> [prophile_learns_paws.irc.log](http://elliottcable.s3.amazonaws.com/p/prophile_learns_paws.irc.log)

Running Code
============
Let's jump right into it. You can get an interactive REPL-style interface out of this library (see
<./README.markdown>), which will allow you to type Paws expressions, and have them evaluated in
sequence, in a single, shared context. In Paws, every document or other input-source is a tree of
*expressions*. Unlike most other languages (except perhaps LISP variants), there are no statements;
you can't type multiple expressions, separated by semicolons, and have them executed sequentially.

There are two possible elements within an expression: values (and unlike other languages, I don't
mean “value literals” by this — I literally mean *inline values*, embedded into the expression),
and sub-expressions. Sub-expressions (denoted by parenthesis-grouping in the syntax you'll be
using in the REPL) denote ‘indirection,’ in that they're evaluated the same way the parent
expression is, and then their *result* is evaluated in their place in the parent expression.

A Paws expression as described above is thus an ordered series of *values*; values that are applied
to eachother in a left-associative fashion (that is, “a b c” is evaluated as “a-b” and then
“(a-b)-c”) with the only ‘operator’ we have: juxtaposition. (Also known as the “space operation.”)
Juxtaposition of two values in Paws has a re-definable semantics, but at this point in your
education, can be assumed to mean either 1. a “member lookup” as you may be familiar with it from
other languages (think “foo bar” means the JavaScript equivalent of `foo['bar']`), or 2.
procedure-calling (think `foo('bar')` in JavaScript.)

You'll be typing the above semantics into the REPL you've opened using a syntax called “canonical
Paws” (or ‘cPaws’ for short). It includes literal representations of two key types of values;
‘labels’ (which are similar to `Symbol`s, if you're coming from Ruby, or their analog in various
Schemes), and ‘executions’ (which have no analog in any language you're familiar with, but you can
safely think of them for the moment as first-class procedures, or continuations). These are all
serialized as follows:

 - label literals: `foo`, simply any series of non-signifigant characters in series
 - juxtaposition: `foo bar`, any two *other* things separated by whitespace
 - indirection (sub-expressions): `foo (bar baz) widget`, an expression, parenthesized
 - execution literals: `foo { bar baz } widget`, an expression embedded within curly braces

This “mini-syntax” is what you'll be typing into the REPL, to represent Paws expressions. In fact,
let's get to that.

First Steps
===========
Paws is an *inherently asynchronous* language. Don't worry if you don't know what that means. *Do*
worry if you *think* you know what that means, because you're wrong. For one thing, this means that
even the most basic operation preformed by the most basic element of syntax happens asynchronously.
You'll figure that out in a bit.

In fact, in applying the expected semantics of a interactive, synchronous REPL (as you are familiar
with them) to Paws, we have an interesting problem: if whatever you type never “completes” in some
way (the specifics of which I'll leave up to a more thorough exploration of Paws' semantics), then
the REPL can never proceed to showing you the next prompt. So, if you're playing with it, and it
appears to “freeze” (that is, never shows another prompt and stops accepting input), then don't
worry; you just made a mistake in the last line you'd typed. You can `⌃c` to force a new prompt, or
if the input stream isn't responding at all, you can do the same from outside the process
(`killall -INT node`).

Let's start typing stuff into that REPL. In each expression (including sub-expressions), the first
value in the expression is *implicitly* juxtaposed against an invisible “locals” value (a property
of the currently-executing `execution`, but you don't need to worry about what that means yet). In
this REPL, every expression you type *shares* that locals property, which means you can
progressively modify locals, exposing supersequent expressions' modifications available to the
current one.

Additionally, this implementation will expose some “bags of useful procedures” to you on that shared
locals-thing; specifically, `infrastructure` (the minimal core set of ‘procedures’ necessary for any
Paws implementation to allow for even the *most basic* task), and `implementation` (a few extra toys
and tools, things not standardized, but nonetheless provided for your pleasure.)

We'll explore that concept of the ‘locals’ a bit more in a moment, but let's start with something
simpler ... a one-liner that will print something to the terminal:

    implementation util print Hello,world!

See? Easy! Now, there's a couple things of note, here. Remember our analogy to JavaScript? Let's
look at what this might look like, broken down into JavaScript:

    locals['implementation']['util']['print']('Hello,world!')

 - first, notice the difference between some of the juxtapositions becoming “member lookups”, and
   some of them being “procedure calls.” It's beyond the scope of this document to explain why, but
   just assume that when you obtain an execution via lookups, you're then ‘calling into’ it with
   further juxtapositions
 - second, notice that there's (intentionally) no whitespace in our label, “Hello,world!”. There's
   no way to encode whitespace into a label, in the cPaws serialization. This is a good moment to
   realize that *not every possible Paws expression* can be serialized into a cPaws representation
   thereof. Labels with whitespace in them (or, incidentally, the empty label) are a simple example;
   but there's many, many more. For instance, if we had a type of “dog” value, a Paws expression
   could encompass that value directly; and since cPaws has no textual “dog literal” to encode that
   value into, that Paws expression would be unserializable.

This is, however, a rather facile example. Let's try doing the same thing in an unnecessarily
complex way, simply to experiment with the REPL a little more. We'll add that same label to the
locals, and then get it *out* of the locals to print it. So, the first half of that:

    infrastructure affix() (locals) Hello,world!
   
    locals['infrastructure']['affix'](<empty expression?>)( locals['locals'] )('Hello,world!')

 - see that we “call” that execution *multiple times*. You can only provide one ‘parameter’ to a
   Paws execution at a time (for reasons that are, again, beyond the scope of this document); the
   usual pattern is for the execution to ‘return’ itself to you, so you can call it again with
   another parameter, until it has as many as it needs
 - which brings us to the first parameter we pass to `affix...`: what appears to be an empty
   expression. In actual fact, this is a special-case in cPaws that implies a reference to the
   executing execution *itself*. I'll speak more of this in a moment.
 - as explained above, but I'll cover once more; use of parentheses (such as in the second parameter
   to `affix...`) are *indirection*. Their contents are processed independantly, as another
   expression (and again, implicitly juxtaposed against the ‘locals’); then the *result* thereof is
   juxtaposed against the previous value in the outer expression. In this particular case, we're
   accessing a self-reference on the locals object to gain a handle on it, itself.

Now, let's look a little more into that empty expression (or, more accurately, ‘self reference.’) In
Paws, everything is “fall-forward” (that means, nothing ever ‘returns’ to an earlier stack-frame.)
Instead, we pass *ourselves* (see why we use a self-reference, there?) to the proccedure we're
calling, so that it can call *us* again, later. Specifically, however, because Paws only allows you
to pass a single thing at a time, it's going to call us again, *immediately*, so that we can pass it
the second argument ... and then, the same again, for the third.

That pattern of back-and-forth between a caller and its callee is something we call “coconsumption”
(or, if you look at it from the other side, “coproduction.”) The caller ‘coproduces’ parameters
*into* the callee; and the very first thing it coproduces is a reference to itself, so it can can be
called back to.

At this point, if you've been listening very closely, you may be wondering why the *first* example
didn't have a self-reference (that is, why it didn't say `print() Hello,world!`). This is simply
because we only provide ourselves to the caller if they'll *need* us for some reason. That example
never returns, and it only takes the one argument; so it doesn't *need* a handle on us (the caller)
to 1. provide a result, or 2. accept further arguments. Simple.

Execution Model
===============
Woah there, cowboy. What's that I just said? “That example never returns.” That's a pretty crazy
statement. Am I saying that the `print.` procedure doesn't return? Yeah, honey, I'm pretty sure
that's what I just said. It doesn't return.

In fact, *nothing* in Paws returns. I mentioned that before, but let's cover it in more detail. If
you're familiar with the concept, you may be comparing what you know thus far of Paws' execution
model to the ‘continuation-passing style’ ocassionally utilized in other languages. This is a fairly
accurate assessment, as long as you understand that it's *completely pervasive* over here in
Paws-land. *Every single juxtaposition* can be thought of as a CPS-call to something else. 

... TO BE CONTINUED *dun dun dun*
