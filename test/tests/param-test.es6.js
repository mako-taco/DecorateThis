'use strict';

import {Any, AnyOf, ArrayOf} from 'typedefs';
import param from 'param';

describe('param', () => {

	class T {
		constructor(str) {
			this.str = str;
		}

		@param(String)
		mirror(i) {
			return i;
		}

		@param(Number)
		number(i) {
			return i;
		}

		@param(Boolean)
		boolean(i) {
			return i;
		}

		@param(String)
		string(i) {
			return i;
		}

		@param(Object)
		object(i) {
			return i;
		}

		@param(Any)
		any(i) {
			return i;
		}

		@param(AnyOf(String, Boolean))
		anyOfStringBoolean(i) {
			return i;
		}

		@param(String)
		static mirror(i) {
			return i;
		}

		@param({name: String, obj: {age: Number}})
		shape(i) {
			return i;
		}

		@param(ArrayOf(Number))
		arrayOfNumbers(i) {
			return i;
		}

		@param(ArrayOf({name: String, age: Number}))
		arrayOfPeople(i) {
			return i;
		}
	}

	it('should validate a single arg', () => {
		let t = new T();
		(() => {
			t.mirror(5);
		}).should.throw();

		t.mirror('hi').should.equal('hi');
	});

	it('should validate a static method', () => {
		(() => {
			T.mirror(5);
		}).should.throw();

		T.mirror('hi').should.equal('hi');
	});

	it('should validate Numbers', () => {
		let t = new T();
		(() => {
			t.number('5');
		}).should.throw();

		t.number(5).should.equal(5);
	});

	it('should validate Booleans', () => {
		let t = new T();
		(() => {
			t.boolean('5');
		}).should.throw();

		t.boolean(true).should.equal(true);
	});

	it('should validate Strings', () => {
		let t = new T();
		(() => {
			t.string(5);
		}).should.throw();

		t.string('trues').should.equal('trues');
	});

	it('should validate Any', () => {
		let t = new T();
		let obj = {};
		t.any('trues').should.equal('trues');
		t.any(5).should.equal(5);
		t.any(obj).should.equal(obj);
	});

	it('should validate AnyOf', () => {
		let t = new T();
		t.anyOfStringBoolean('asd').should.equal('asd');
		t.anyOfStringBoolean(false).should.equal(false);
		t.anyOfStringBoolean.bind(t, 5).should.throw();
	});

	describe('when validating an array of types', () => {
		let t = new T();
		let simple = [1, 2, 3];
		let complex = [{name: 'ted', age: 30}, {name: 'bob', age: 20}];
		let badSimple = [1, 2, 'asd'];
		let badComplex = [{name: 'ted', age: 30}, {age: 20}];

		it('should validate arrays of simple types', () => {
			t.arrayOfNumbers(simple).should.equal(simple);
		});

		it('should validate arrays of complex types', () => {
			t.arrayOfPeople(complex).should.equal(complex);
		});

		it('should throw on bad complex arrays', () => {
			t.arrayOfPeople.bind(t, badComplex).should.throw(
				'arrayOfPeople(i) type mismatch: expected `i[1].name` to be `String`, got `undefined`'
			);
		});

		it('should throw on bad simple arrays', () => {
			t.arrayOfNumbers.bind(t, badSimple).should.throw(
				'arrayOfNumbers(i) type mismatch: expected `i[2]` to be `Number`, got `asd`'
			);
		});

		it('should throw on non-arrays', () => {
			t.arrayOfNumbers.bind(t, {}).should.throw(
				'arrayOfNumbers(i) type mismatch: expected `i` to be array of `Number`, got `Object`'
			);
		});

	});

	describe('when validating a shape', () => {
		let t = new T();
		let good = {name: 'sup', obj: {age: 5}};
		let bad = {name: 'sup', obj: {age: true}};
		let missing = {obj: {age: true}};

		it('should validate good objects', () => {
			t.shape(good).should.equal(good);
		});

		it('should throw on bad objects', () => {
			t.shape.bind(t, bad).should.throw(
				'shape(i) type mismatch: expected `i.obj.age` to be `Number`, got `true`'
			);
		});

		it('should throw on missing fields in the obj', () => {
			t.shape.bind(t, missing).should.throw(
				'shape(i) type mismatch: expected `i.name` to be `String`, got `undefined`'
			);
		});
	});

	describe('when passed no value', () => {
		it('`Any` should throw', () => {
			let t = new T();
			t.any.bind(t, undefined).should.throw();
		});

		it('`String` should throw', () => {
			let t = new T();
			t.string.bind(t, undefined).should.throw();
		});

		it('`Number` should throw', () => {
			let t = new T();
			t.number.bind(t, undefined).should.throw();
		});

		it('`Boolean` should throw', () => {
			let t = new T();
			t.boolean.bind(t, undefined).should.throw();
		});
	});
});
