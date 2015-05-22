'use strict';

const ValidatorResult = require('ValidatorResult');

export default class Validator {
	static validate(path, item, type) {
		if (typeof type === 'string') {
			if (typeof item !== type) {
				return new ValidatorResult(item, {
					name: path,
					expected: type,
					found: typeof item
				});
			}
		}
		else if (type instanceof Validator) {
			return type.test(path, item, type);
		}
		else if (typeof type === 'object') {
			for (let key in type) {
				if (type.hasOwnProperty(key)) {
					let result = Validator.validate(`${path}.${key}`, item[key], type[key]);
					if (result) {
						return result;
					}
				}
			}
		}
		else if (typeof type === 'function') {
			if (!(item instanceof type)) {
				return new ValidatorResult(item, {
					name: path,
					expected: type.name || 'Unnamed Class',
					found: item.constructor.name || typeof item
				});
			}
		}
	}

	constructor(fn) {
		this.test = fn;
	}
}
