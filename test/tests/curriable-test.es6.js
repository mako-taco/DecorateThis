import curriable from 'curriable';

class T {
	constructor(){

	}

	@curriable
	multiVariable(a, b, c) {
		return a + b + c;
	}
}

describe('curriable', () => {
	it('should work on multiVariable functions', () => {
		let obj = new T;
		obj.multiVariable(1)(2)(3).should.equal(6);
	});

	it('should throw errors when wrapping a function with no named args', () => {
		(() => {
			let obj = {
				@curriable
				noVariable() {

				}
			};
		}).should.throw('A function must have at least one named argument to be decorated with ' +
		'`curriable`.');
	});
});
