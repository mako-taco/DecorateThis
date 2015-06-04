'use strict';

import {Validator, ValidatorResult, getNameForType} from 'validator';

export const Any = new Validator((path, value) => {
	if (!value) {
		return new ValidatorResult(path, 'any value', value);
	}

	return null;
});

export const AnyOf = (...types) => {
	const names = types.map(getNameForType).join(', ');

	return new Validator(function anyOf(path, value) {
		const results = types.map(type => {
			return Validator.validate(path, value, type);
		}).filter(result => result);

		if (results.length === types.length) {
			return new ValidatorResult(path, this.typeName, value);
		}

		return null;
	}, `any of (${names})`);
};

export const ObjectOf = (type) => {
	return new Validator((path, value) => {
		if (typeof value !== 'object') {
			return new ValidatorResult(path, this.typeName, value);
		}

		for (const i in value) {
			const result = Validator.validate(`${path}.${i}`, value[i], type);
			if (result) {
				return result;
			}
		}

		return null;
	}, `object of ${getNameForType(type)}`);
};

export const ArrayOf = (type) => {
	return new Validator(function arrayOfValidator(path, value) {
		if (!Array.isArray(value)) {
			return new ValidatorResult(path, this.typeName, value);
		}

		for (const i in value) {
			const result = Validator.validate(`${path}[${i}]`, value[i], type);
			if (result) {
				return result;
			}
		}

		return null;
	}, `array of ${getNameForType(type)}`);
};

export const Shape = (type) => {
	if (typeof type !== 'object') {
		throw new TypeError('Shape requires an object to validate against');
	}

	return new Validator(function shapeValidator(path, value) {
		if (typeof value !== 'object') {
			return new ValidatorResult(path, this.typeName, value);
		}

		// expect all the keys in 'shape' to be in object
		for (const key in type) {
			let result = Validator.validate(`${path}.${key}`, value[key], type[key]);
			if (result) {
				return result;
			}
		}

		return null;
	}, 'a duck-typed object');
};

export const Optional = (type) => {
	return new Validator((path, value) => {
		if (value === null || value === undefined) {
			return null;
		}
		else {
			return Validator.validate(path, value, type);
		}
	});
};
