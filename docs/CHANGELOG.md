# Changelog

### v0.4.0
- broke up `param` file into smaller, more reusable components
- fixed a bug in `WeakCompositeKeyMap` which would cause a map of results to be
returned instead of the correct value
- added `@promises` decorator, which checks promised values

### v0.3.5
- `npm install` of this module will now load an es5 compatible file using the
babel runtime

### v0.2.3
- fixed a bug in `@debounce` which would cause multiple debounced methods of a
single class instance to debounce eachother
- added eslint to travis-ci builds

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
