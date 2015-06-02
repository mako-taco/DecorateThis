'use strict';

export function enumerable(val) {
	return (target, name, descriptor) => {
		descriptor.enumerable = Boolean(val);
	};
}

export function writable(val) {
	return (target, name, descriptor) => {
		descriptor.writable = Boolean(val);
	};
}

export function configurable(val) {
	return (target, name, descriptor) => {
		descriptor.configurable = Boolean(val);
	};
}
