'use strict';

let accepts = require('src/accepts');

let arrayOfNumbers = function (args, i) {
	let arg = args[i];
	if (!Array.isArray(arg)) {
		return new Error('expected array of numbers, got non-array.');
	}
	else if (!arg.every(x => typeof x === 'number')) {
		return new Error(`expected array of numbers, got array of non-numbers`);
	}
};

class Thing {
	constructor() {

	}
}

class BadThing {
	constructor() {

	}
}

class TestAccepts {
	constructor() {

	}

	@accepts('string')
	singleStringFn(dawg) {
		return `sup ${dawg}`;
	}

	@accepts('string', 'number', 'boolean')
	multipleArgFn(string, number, bool) {

	}

	@accepts(accepts.arrayOf('string'))
	arrayOfFn() {

	}

	@accepts(accepts.types('string', 'number'))
	typesFn() {

	}

	@accepts(accepts.arrayOf(accepts.types('string', 'number')))
	complexFn() {

	}

	@accepts({name: 'string', info: {age: 'number'}})
	duckTypedFn() {

	}

	@accepts(Thing)
	constructorFn() {

	}
}

var literal = {
	@accepts('string')
	what(str) {
		return str;
	}
}

let t = new TestAccepts();


describe('accepts', () => {
	it('not throw when the only arg is of the correct type', () => {
		(() => {
			t.singleStringFn('hi');
		}).should.not.throw();
	});

	it('shouldn\'t break functions', () => {
		t.singleStringFn('hi').should.equal('sup hi');
	});

	it('should throw errors when a single arg is of the wrong type', () => {
		(() => {
			t.singleStringFn(5);
		}).should.throw(/singleStringFn type mismatch: `dawg` expected string, got number\./);
	});

	it('should throw errors when one of many args is the wrong type', () => {
		(() => {
			t.multipleArgFn('ok', 'bad!', true);
		}).should.throw(/multipleArgFn type mismatch: `number` expected number, got string\./);
	});

	describe('arrayOf', () => {
		it('should not throw when the type is included', () => {
			(() => {
				t.arrayOfFn(['hi', 'there']);
			}).should.not.throw();
		});

		it('should throw when the type is not included', () => {
			(() => {
				t.arrayOfFn([5]);
			}).should.throw();
		});
	});

	describe('types', () => {
		it('should not throw when any of the types are included', () => {
			(() => {
				t.typesFn('asd');
				t.typesFn(55);
			}).should.not.throw();
		});

		it('should throw when none of the types are included', () => {
			(() => {
				t.typesFn({});
			}).should.throw();
		})
	});

	describe('ducktypes', () => {
		it('should work', () => {
			(() => {
				t.duckTypedFn({name: 'hi', info: {age: 50}})
			}).should.not.throw();

			(() => {
				t.duckTypedFn({name: 'hi', info: {age: '50'}})
			}).should.throw(/duckTypedFn type mismatch: `arg0\.info\.age` expected number, got string\./);
		});
	});

	it('should work for constructors', () => {
		(() => {
			t.constructorFn(new Thing());
		}).should.not.throw();

		(() => {
			t.constructorFn(new BadThing());
		}).should.throw();
	});

	it('should be composable', () => {
		(() => {
			t.complexFn(['asd', 5, 'asdsad', 2, 1]);
		}).should.not.throw();

		(() => {
			t.complexFn(['asd', {}, 'asdsad', 2, 1]);
		}).should.throw();
	});

	it('should work on plain objects', () => {
		literal.what('asd').should.equal('asd');

		(() => {
			literal.what(5);
		}).should.throw();
	});
});
