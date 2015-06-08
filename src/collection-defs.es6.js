'use strict';

import {Validator} from 'validator';

/**
 * returns a function which returns a  validator which can do shape checks on
 * arbitary collection types
 *
 * @param {Class} constructor - used for an instanceof check
 * @param {function} transform - takes in value, returns a plain object which
 *   represents that value
 */

export function KeyedCollection({constructor, transform, name = constructor.name}) {
	return function keyedCollectionWrapper(type) {
		return new Validator((path, value) => {
			const constructorCheck = Validator.validate(path, value, constructor);

			if (constructorCheck) {
				constructorCheck.expected = `\`${name}\``;
				return constructorCheck;
			}

			const transformed = transform(value);
			const shapeCheck = Validator.validate(path, transformed, type);

			if (shapeCheck) {
				return shapeCheck;
			}

			return null;
		});
	};
}

/**
 * returns a function which returns a validator which can do type checks on
 * every member of a collection
 *
 * @param {Class} constructor - used for an instanceof check
 * @param {function} transform - takes in a value, returns an array of objects
 *   to do type checks on
 */
export function TypedCollection({constructor, transform, name = constructor.name}) {
	return function typedCollectionWrapper(type) {
		return new Validator((path, value) => {
			const constructorCheck = Validator.validate(path, value, constructor);

			if (constructorCheck) {
				constructorCheck.expected = `\`${name}\``;
				return constructorCheck;
			}

			const transformed = transform(value);

			for (let key in transformed) {
				const result = Validator.validate(`${path}.${key}`, transformed[key], type);
				if (result) {
					return result;
				}
			}

			return null;
		});
	};
}
