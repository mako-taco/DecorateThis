'use strict';

import {Validator} from 'validator';

const targetParams = new WeakMap();

export default function param(type, description) {
	return (target, name, descriptor) => {
		let firstTime = false;
		let nameMap = targetParams.get(target);

		if (!nameMap) {
			nameMap = new Map();
			targetParams.set(target, nameMap);
		}

		let params = nameMap.get(name);

		if (!params) {
			firstTime = true;
			params = [];
			nameMap.set(name, params);
		}

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
	};
}
