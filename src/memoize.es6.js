'use strict';

import WeakCompositeKeyMap from 'weak-composite-key-map';

let memoized = new WeakCompositeKeyMap();

function memoize(target, name, descriptor) {
	const value = descriptor.value || descriptor.initializer();
	
	descriptor.value = function (...args) {
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

function memoizationFor(obj) {
	let table = memoized.get(obj);

	if (!table) {
		table = Object.create(null); memoized.set(obj, table);
	}

	return table;
}

export default memoize;