'use strict';

import {Shape} from 'typedefs';

export function getNameForType(type) {
	if (typeof type === 'string') {
		return type;
	}
	else if (type === String) {
		return '`String`';
	}
	else if (type === Number) {
		return '`Number`';
	}
	else if (type === Boolean) {
		return '`Boolean`';
	}
	else if (type === Object) {
		return '`Object`';
	}
	else if (type instanceof Validator) {
		return `${type.getTypeName()}`;
	}
	else {
		return type.name || '<Anonymous>';
	}
}

export function getNameForValue(value) {
	if (value === null ||
		value === undefined ||
		typeof value === 'number' ||
		typeof value === 'string' ||
		typeof value === 'boolean') {
		return `${value}`;
	}
	else if (value.constructor.name) {
		return `${value.constructor.name}`;
	}
	else {
		return `${value.toString()}`;
	}
}

// @param(Function, 'called to test a value, passed `path` and `value`')
// @param(Optional(String), 'describes in plain english the type being validated')
export class Validator {
	constructor(fn, typeName = '<Anonymous>') {
		this.fn = fn;
		this.typeName = typeName;
	}

	// @param(String)
	// @param(Any)
	// @returns(ValidatorResult)
	validate(path, value) {
		return this.fn(path, value);
	}

	// @returns(String)
	getTypeName() {
		return this.typeName;
	}

	// @param(String)
	// @param(Any)
	// @param(AnyOf(Validator, Function))
	// @returns(ValidatorResult)
	static validate(path, value, type) {
		if (type instanceof Validator) {
			return type.validate(path, value);
		}
		else if (type instanceof Function) {
			try {
				if (type(value) === value) {
					return null;
				}
			}
			catch(err) {}

			if (value instanceof type) {
				return null;
			}
		}
		else if (typeof type === 'object') {
			return (new Shape(type)).validate(path, value);
		}

		return new ValidatorResult(path, type, value);
	}
}

// @param(String, 'identifies the path to the current value')
// @param(String, 'describes the type expected at `path`')
// @param(Any, 'the actual value found at `path`')
export class ValidatorResult {
	constructor(path, expected, found) {
		this.path = path;
		this.expected = expected;
		this.found = found;
	}

	// @returns(String)
	getPath() {
		return this.path;
	}

	// @returns(String)
	getExpected() {
		return this.expected;
	}

	// @returns(Any)
	getFound() {
		return this.found;
	}

	// @returns(String)
	getMessage() {
		const valueName = getNameForValue(this.found);
		const typeName = getNameForType(this.expected);

		return `expected \`${this.path}\` to be ${typeName},` +
			` got \`${valueName}\``;
	}
}
