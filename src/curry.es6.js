'use strict';

export default function curry(target, name, descriptor) {
	const value = descriptor.value || descriptor.initializer();
	const argNames = value.toString()
		.match(/\((.*?)\)/)[1]
		.split(/\s*,\s*/)
		.filter(argname => argname);

	if (typeof value !== 'function') {
		throw new TypeError('Only functions can be decorated with `curry`.');
	}

	if (argNames.length === 0) {
		throw new Error('A function must have at least one named argument to be decorated with ' +
			'`curry`.');
	}

	descriptor.value = function curryWrapper(...args) {
		if (args.length < argNames.length) {
			return function curryBuilder(newArgs) {
				return descriptor.value.call(this, ...(args.concat(newArgs)));
			};
		}
		else {
			return value.call(this, ...args);
		}
	};

	return descriptor;
}
