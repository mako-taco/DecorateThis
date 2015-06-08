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

## Custom collections
Use these methods to create validators which work on your own collection data
structures, such as those in ImmutableJS. 

### KeyedCollection
A keyed collection is used to validate an argument which is a complex data
structure that can be reduced to (possibly deep) key-value pairs.

You provide three values to `KeyedCollection` to create a validator:
 - `constructor`: used for an `instanceof` check against the entire collection
 - `transform`: passed the collection, must return a plain object which
    represents the data held by the collection
 - `name`: a human-readable name for the type of collection. Used to generate
    meaningful error messages

A function will be returned, which takes a single argument: `shape`. This new
function checks values in the following way:
 1. `value` is tested to be an instanceof `collection`
 2. `value` is passed to transform
 3. the transformed value is checked against `shape` in the same way that normal
    objects are checked via duck-types

```js
import {KeyedCollection} from 'collection-defs';
import Immutable from 'immutable';

const ImmutableMap = KeyedCollection({
    constructor: Immutable.Map, 
    transform: x => x.toObject(),
    name: 'ImmutableMap'
});

class T {
    @param(ImmutableMap({name: String, age: Number}))
    doThing(person) {

    }
}

const t = new T();

t.doThing({name: 'Jake', age: 25}); //throws error, not ImmutableMap
t.doThing(Immutable.fromJS({name: 'Jake'}); //throws error, age is not a number
t.doThing(Immutable.fromJS({name: 'Jake', age: 25})) //OK
```

### TypedCollection
A keyed collection is used to validate an argument which is a complex data
structure that can be reduced to a (possibly deep) array of typed values.

You provide three values to `TypedCollection` to create a validator:
 - `constructor`: used for an `instanceof` check against the entire collection
 - `transform`: passed the collection, must return an array which represents the
    data held by the collection
 - `name`: a human-readable name for the type of collection. Used to generate
    meaningful error messages

A function will be returned, which takes a single argument: `type`. This new
function checks values in the following way:
 1. `value` is tested to be an instanceof `collection`
 2. `value` is passed to transform
 3. Each member of the array that results from `transform(value)` will be tested
    against `type`

```js
import {KeyedCollection} from 'collection-defs';
import Immutable from 'immutable';

const ImmutableMapOf = TypedCollection({
    constructor: Immutable.Map, 
    transform: x => x.toObject(),
    name: 'ImmutableMap'
});

class T {
    @param(ImmutableMapOf(Number))
    doThing(ages) {

    }
}

const t = new T();

t.doThing({jake: 25, josh: 24}); //throws error, not ImmutableMap
t.doThing(Immutable.fromJS({name: 'Jake', age: 25})) //throws error, name is not `Number`
t.doThing(Immutable.fromJS({jake: 25, josh: 24}); //OK
```
