# DecorateThis
Simple, vanilla JS type checking through ES7 decorators
...and a few other decorators, to boot.

```
npm install decorate-this
```

If you like this project, be sure to check out [FluxThis](https://github.com/addthis/FluxThis), the immutable Flux framework by [AddThis](http://www.addthis.com).

[![npm version](https://badge.fury.io/js/decorate-this.svg)](http://badge.fury.io/js/decorate-this)
[![Build Status](https://travis-ci.org/mako-taco/DecorateThis.svg?branch=master)](https://travis-ci.org/mako-taco/DecorateThis)

# Type Validation
Throw errors when unexpected types are provided or returned from class or object
functions. For more details, see the [Type Validator API](s#type-validator-api).
```js
import {param, returns} from 'decorate-this';

class Point {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    
    // The first param of this method takes a Point, and will throw
    // a type error if a non-Point is passed
    @param(Point)
    // The method returns a Number. If it doesn't, a type error will
    // be thrown before the value is returned.
    @returns(Number)
    distanceTo(point) {
        let squaredDistance = (point.x - this.x) ** 2 + 
            (point.y - this.y) ** 2;
        
        return Math.sqrt(squaredDistance);
    }
    
    // Two number args, no return value
    @param(Number)
    @param(Number)
    addToDimensions(x, y) {
        this.x += x;
        this.y += y;
    }
}
```

# Memoization
Automatically memoize functions for greater efficiency
```js
import memoize from 'decorate-this';
let obj = {
    // Results of the function are stored in a map, which maps arguments
    // to the function's result. This expensive func is only run a single
    // time for a given a/b pair.
    @memoized
    expensiveFunc(a, b) {
        return Math.sin(Math.sqrt(a ** b));
    }
};
```

# Property descriptors
```js
import {enumerable, writable, configurable} from 'decorate-this';

class T {
    @configurable(false)
    @enumerable(false)
    @writable(false)
    hiddenMethod() {
        /* ... */
    }
}
```

# Currying
Build up long argument lists with currying
```js
let obj = {
    @curry
    curriedAdd(a, b, c) {
        return a + b + c;
    }
}

let addToFive = obj.curriedAdd(5);   // Function
let addToFiveAndThree = addToFive(3);  // Function
let sum = addToFiveAndThree(7);      // 15
```

# Debouncing
Rate-limit expensive or frequently called functions

```js
let obj = {
    @debounce(500) // call after 500ms of no further calls
    debouncedFn(event) {
        console.log(event.clientX, event.clientY);
    }
}
```

# Type Validator API
Types can be expressed in a few ways:
 - A native constructor, like `Object` or `Boolean`
 - A constuctor or class, like `Point`
 - An object literal, for duck-typing, like `{name: String, age: Number}`
 - A special helper function from `types`, like `ArrayOf(String)`
 
## Native Constructor Types
The most common types to check for. All other type checks are built around 
these.

```js
@param(Number)
@param(String)
@param(Boolean)
@param(Object)
@param(Array)
@param(Function)
```

Or any function which passes this check for a given set of values:
```js
let passes = Fn(x) === x
```

## Constructor or Class Types
Use your own class constructors to serve as `instanceof` validators:
```js
class T {
    constructor() {

    }
    
    @param(T)
    doThing(t) {

    }
}
```

## Object-literal Duck-types
Object literals are used to do 'duck-type' checks. All keys in a param must
exist in the duck type, and must be of the correct type, for the check to
pass.

```js
class T {
    @param({hello: String, info: {age: Number, color: String}});
    method(options) {
        this.hello = options.hello;
    }
}

// throws error, color is missing
(new T).method({hello: 'hi', info: {age: 5}})

// throws error, info.age is not a number
(new T).method({hello: 'hi', info: {age: '5', color: 'red'}}) 
```

As with all types, these are composable.

## Built-in Types
DecorateThis provides a small library of helper functions for doing type
validation.

```js 
import {
    AnyOf,
    ObjectOf,
    ArrayOf,
    Optional,
    Any
} from 'decorate-this';

let util = {
    @param(ArrayOf(Any))
    @param(Optional(Boolean))
    @returns(ArrayOf(Any))
    sortArray(array, reverse=false) {
        /* ... */
    }
}
```

### AnyOf
When a single value is allowed to be one of many types, use `AnyOf`.
```js
@param(AnyOf(Number, String))

let pass = 5;
let pass2 = '5';
let fail = true;
```

### ObjectOf
When an object contains a specific type of values, use `ObjectOf`. If the object
you want to validate contains many types, use duck-typing instead
```js
@param(ObjectOf(Boolean))

let pass = {abc: true, bcd: false};
let fail = {abc: true, bcd: null}
```

### ArrayOf
Like `Array`, but lets you validate the type of each element
```js
@param(ArrayOf(String))

let pass = [];
let pass2 = ['Hello', 'world'];
let fail = 5;
let fail2 = [5];
```

### Optional
If the param is missing, this check passes. If not, it validates the type.
```js
class T = {
    @param(String)
    @param(Optional(Boolean))
    method (name, capitalize=true) {

    }
}

// OK
(new T).method('jake');
(new T).method('jake', false);

// Not OK
(new T).method('jake', 5);
```

### Any
A special check that always passes, unless a value is missing.
```js
class T {
    @param(Any)
    method(i) {

    }
}

// OK
(new T).method('str');
(new T).method(5);
(new T).method(() => {});

// Not OK
(new T).method();
```

# Incorporating in your project
- Build your project with Babel
- Enable stage 1 (experimental) features
- Profit

# Changelog
### v0.2.2
- fixed a bug in `@debounce` which would cause multiple instances of a class to
all debounce eachother's methods

### v0.2.1
- fixed a bug in `@memoize` which would cause a function to always compute new
values
- lint issues + removal of dead code

### v0.2.0
- `@memoize` now properly works accross multiple instances of a class

### v0.1.0
- added support for `@curry` and `@debounce()`
