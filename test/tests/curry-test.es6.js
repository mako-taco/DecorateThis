import curry from 'curry';

class T {
	constructor(){

	}

	@curry
	multiVariable(a, b, c) {
		return a + b + c;
	}
}

describe('curry', () => {
	it('should work on multiVariable functions', () => {
		let obj = new T;
		obj.multiVariable(1)(2)(3).should.equal(6);
	});

	it('should throw errors when wrapping a function with no named args', () => {
		(() => {
			let obj = {
				@curry
				noVariable() {

				}
			};
		}).should.throw('A function must have at least one named argument to be decorated with ' +
		'`curry`.');
	});
});
