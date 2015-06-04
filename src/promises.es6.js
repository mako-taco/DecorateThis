'use strict';

import {Validator} from 'validator';

export default function promises(type, description) {
	return (target, name, descriptor) => {
		const value = descriptor.value || descriptor.initializer();
		descriptor.value = function promisesWrapper(...args) {
			const returnValue = value.apply(this, args);

			if (!returnValue || typeof returnValue.then !== 'function') {
				throw new TypeError(
					`${name} type mismatch: Expected a thenable`
				);
			}

			return returnValue.then(fulfillmentValue => {
				const result = Validator.validate('promised value', fulfillmentValue, type);

				if (result) {
					throw new TypeError(
						`${name} type mismatch: ${result.getMessage()}`
					);
				}

				return fulfillmentValue;
			});
		};

		return descriptor;
	};
}
