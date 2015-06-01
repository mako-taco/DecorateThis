'use strict';

import WeakCompositeKeyMap from 'weak-composite-key-map';

let memoized = new WeakCompositeKeyMap();

export default function memoize(target, name, descriptor) {
	const value = descriptor.value || descriptor.initializer();

	descriptor.value = function memoizeWrapper(...args) {
		let result = memoized.get([value, this, ...args]);

		if (result) {
			return result;
		}
		else {
			result = value.apply(this, args);
			memoized.set([value, this, ...args], result);
			return result;
		}
	};

	return descriptor;
}
