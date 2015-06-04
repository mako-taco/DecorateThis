'use strict';

import {Validator} from 'validator';

export default function returns(type, description) {
	return (target, name, descriptor) => {
		const value = descriptor.value || descriptor.initializer();
		descriptor.value = function returnsWrapper(...args) {
			const returnValue = value.apply(this, args);
			const result = Validator.validate('return value', returnValue, type);

			if (result) {
				throw new TypeError(
					`${name} type mismatch: ${result.getMessage()}`
				);
			}
			return returnValue;
		};

		return descriptor;
	};
}
