import {KeyedCollection, TypedCollection} from 'collection-defs';
import param from 'param';
import Immutable from 'immutable';

describe('KeyedCollection', () => {
	describe('when describing an immutable map', () => {
		const ImmutableMap = KeyedCollection({
			name: 'ImmutableMap',
			constructor: Immutable.Map, 
			transform: x => x.toObject()
		});

		class T {
			@param(ImmutableMap({a: String, b: Number}))
			method(x) {
				return x;
			}
		}

		it('should fail on a malformed immutable map', () => {
			var immMap = Immutable.Map({a: 'Hey', b: 'Bye'});
			(() => {
				(new T()).method(immMap);
			}).should.throw('method(x) type mismatch: expected `x.b` to be `Number`, got `Bye`');
		});

		it('should not fail on well-formed immutable maps', () => {
			var immMap = Immutable.Map({a: 'Hey', b: 1});
			(new T()).method(immMap).should.equal(immMap);
		});

		it('should fail on anything that isn\'t an immutable map', () => {
			var nonImmMap = {a: 'Hey', b: 1};
			(() => {
				(new T()).method(nonImmMap);
			}).should.throw('method(x) type mismatch: expected `x` to be ' +
			'`ImmutableMap`, got `Object`');
		});
	});
});

describe('TypedCollection', () => {
	describe('when describing an immutable map of numbers', () => {
		const ImmutableMapOf = TypedCollection({
			name: 'ImmutableMap',
			constructor: Immutable.Map, 
			transform: x => x.toObject()
		});

		class T {
			@param(ImmutableMapOf(String))
			method(x) {
				return x;
			}
		}

		it('should fail on a malformed immutable map', () => {
			var immMap = Immutable.Map({a: 'Hey', b: 5});
			(() => {
				(new T()).method(immMap);
			}).should.throw('method(x) type mismatch: expected `x.b` to be `String`, got `5`');
		});

		it('should not fail on well-formed immutable maps', () => {
			var immMap = Immutable.Map({a: 'Hey', b: 'sup'});
			(new T()).method(immMap).should.equal(immMap);
		});

		it('should fail on anything that isn\'t an immutable map', () => {
			var nonImmMap = {a: 'Hey', b: 1};
			(() => {
				(new T()).method(nonImmMap);
			}).should.throw('method(x) type mismatch: expected `x` to be ' +
			'`ImmutableMap`, got `Object`');
		});
	});
});
