'use strict';

let memoized = new WeakMap();

function memoize(target, name, descriptor) {
	let getter = descriptor.get;
	let setter = descriptor.set;
	let methods = {
		get() {
			let table = memoizationFor(this);
			if (name in table) {
				return table[name];
			}

			table[name] = getter.call(this);

			return table[name];
		},
		set(val) {
			let table = memoizationFor(this);
			setter.call(this, val);
			table[name] = val;
		}
	};

	Object.assign(descriptor, methods);

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
