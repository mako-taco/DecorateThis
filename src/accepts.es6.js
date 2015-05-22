'use strict';

const Validator = require('Validator');
const ValidatorResult = require('ValidatorResult');

/**
 * Decorates a function to provide argument validation. Throws errors when args
 * do not meet defined criteria. Passing a string will result in a typeof check,
 * passing a function will call that function, passing all arguments, and the
 * index of arguments to check. The function should either return an error, or
 * not. Returned errors will have their messages appended to the TypeError that
 * `accepts` will throw.
 *
 * Types: function
 * Usage: @accepts('string', 'number', validatorFn)
 *
 * @param {...(String|function)} valdators
 * @return {function}
 */

function acceptsFactory(...types) {
	return function accepts(target, fnName, descriptor) {
		let value = descriptor.value || descriptor.initializer();
		let argNames = value.toString()
			.match(/\((.*?)\)/)[1]
			.split(/\s*,\s*/)
			.filter(argname => argname);

		delete descriptor.initializer;

		// Give names to unnamed variables
		while (argNames.length < types.length) {
			argNames.push(`arg${argNames.length}`);
		}

		descriptor.value =  function wrapper(...args) {
			let labeledArgs = {};
			let labeledTypes = {};

			for (let i in args) {
				labeledArgs[argNames[i]] = args[i];
				labeledTypes[argNames[i]] = types[i];
			}

			for (let key in labeledArgs) {
				let arg = labeledArgs[key];
				let type = labeledTypes[key];

				if (!type) {
					continue;
				}

				let result = Validator.validate(key, arg, type);

				if (result) {
					throw new TypeError(
						`${fnName} type mismatch: ${result.getMessage()}`
					);
				}
			}

			return value.apply(this, args);
		};
		
		return descriptor;
	};
}


Object.assign(acceptsFactory, {
	any() {
		return () => {
			return true;
		};
	},

	types(...types) {
		return new Validator((path, item) => {
			let results = types.map(type => Validator.validate(path, item, type))
				.filter(result => result);

			if (results.length === types.length) {
				return new ValidatorResult(item, {
					found: typeof item,
					expected: results.map(result => result.expected).join('|'),
					name: path
				});
			}
		});
	},

	optional(type) {
		return () => {
			return true;
		};
	},

	arrayOf(type) {
		return new Validator((path, item) => {
			if (!Array.isArray(item)) {
				let result = Validator.validate(path, item, Array);
				if (result) {
					return result;
				}
			}

			let results = item.map((item2, i) => Validator.validate(`${path}.${i}`, item2, type))
				.filter(result => result);

			if (results.length) {
				return results[0];
			}
		});
	},

	objectOf(type) {
		return () => {
			return true;
		};
	}
});


// acceptsFactory.objectOf = function (type) {

// };

// acceptsFactory.instanceOf = function (constructor) {
// 	return function (name, args, i) {

// 	};
// };

// acceptsFactory.types = function (...types) {

// };

// acceptsFactory.oneOf = function (...values) {

// };

export default acceptsFactory;