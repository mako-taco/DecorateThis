'use strict';


export default function debounceFactory(time = 500) {
	return function debounce(target, name, descriptor) {
		const value = descriptor.value || descriptor.initializer();
		const timeouts = new WeakMap();

		if (typeof value !== 'function') {
			throw new TypeError('Only functions can be decorated with `debounce`.');
		}

		descriptor.value = function debounceWrapper(...args) {
			let timeout = timeouts.get(this);

			clearTimeout(timeout);
			timeouts.set(this, setTimeout(() => {
				value.apply(this, args);
			}, time));
		};

		return descriptor;
	};
}
