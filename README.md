# DecorateThis
Simple, vanilla JS type checking through ES7 decorators
...and a few other decorators, to boot.

[Changelog](/docs/CHANGELOG.md)
[Validating Complex Types](/docs/TYPE_VALIDATOR_API.md)
```
npm install decorate-this
```

If you like this project, be sure to check out [FluxThis](https://github.com/addthis/FluxThis), the immutable Flux framework by [AddThis](http://www.addthis.com).

[![npm version](https://badge.fury.io/js/decorate-this.svg)](http://badge.fury.io/js/decorate-this)
[![Build Status](https://travis-ci.org/mako-taco/DecorateThis.svg?branch=master)](https://travis-ci.org/mako-taco/DecorateThis)

# Type Validation
Throw errors when unexpected types are provided or returned from class or object
functions. For more details, see the [Type Validator API](/docs/TYPE_VALIDATOR_API.md).
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
    @memoize
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

# Promises
Similar to `returns`, but validates the fulfillment value of a promise
```js
let obj = {
    @promises(ArrayOf(Number))
    getPoints() {
        return new Promise(resolve => {
            setTimeout(() => resolve([1, 2, 3]), 5000);
        });
    }
}
```
