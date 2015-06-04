'use strict';

const targetParams = new WeakMap();

function getNameForType(type) {
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

function getNameForValue(value) {
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
class Validator {
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
class ValidatorResult {
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

export const Any = new Validator((path, value) => {
	if (!value) {
		return new ValidatorResult(path, 'any value', value);
	}

	return null;
});

export function returns(type, description) {
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

export function promises(type, description) {
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

export function param(type, description) {
	return (target, name, descriptor) => {
		const firstTime = !targetParams.has(target);
		const params = targetParams.get(target) || [];
		params.push({type, description});

		if (firstTime) {
			const value = descriptor.value || descriptor.initializer();
			const argNames = value.toString()
				.match(/\((.*?)\)/)[1]
				.split(/\s*,\s*/)
				.filter(argname => argname);

			// Give names to unnamed variables
			while (argNames.length < params.length) {
				argNames.push(`arg${argNames.length}`);
			}

			descriptor.value = function paramWrapper(...args) {
				const labeledArgs = {};
				const labeledParams = {};

				for (const i in args) {
					labeledArgs[argNames[i]] = args[i];
					labeledParams[argNames[i]] = params[i];
				}

				for (const key in labeledArgs) {
					const arg = labeledArgs[key];
					const labeledParam = labeledParams[key];

					if (!labeledParam) {
						continue;
					}

					const result = Validator.validate(key, arg, labeledParam.type);

					if (result) {
						throw new TypeError(
							`${name}(${argNames.join(', ')}) type mismatch: ${result.getMessage()}`
						);
					}
				}

				return value.apply(this, args);
			};

			return descriptor;
		}

		targetParams.set(target, params);
	};
}

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
