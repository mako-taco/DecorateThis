'use strict';


export default class ValidatorResult {
	constructor(item, {expected, name, found = null}) {
		this.found = found || (typeof item);
		this.name = name;
		this.expected = expected;
	}

	getMessage() {
		return `\`${this.name}\` expected ${this.expected}, got ` +
		`${this.found}.`;
	}
}
