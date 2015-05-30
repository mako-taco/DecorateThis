'use strict';

export default function curriable(target, name, descriptor) {
	const value = descriptor.value || descriptor.initializer();
	const argNames = value.toString()
		.match(/\((.*?)\)/)[1]
		.split(/\s*,\s*/)
		.filter(argname => argname);

	if (typeof value !== 'function') {
		throw new TypeError('Only functions can be decorated with `curriable`.');
	}

	if (argNames.length === 0) {
		throw new Error('A function must have at least one named argument to be decorated with ' +
			'`curriable`.');
	}

	descriptor.value = function curriedWrapper(...args) {
		if (args.length < argNames.length) {
			return function curriedBuilder(newArgs) {
				return descriptor.value.call(this, ...(args.concat(newArgs)));
			};
		}
		else {
			return value.call(this, ...args);
		}
	};

	return descriptor;
}
