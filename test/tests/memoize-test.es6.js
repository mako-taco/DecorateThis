const memoize = require('memoize');

class T {
	constructor(start) {
		this.start = start;
	}

	method(a, b) {
		return a + b + this.start;
	}
}

describe('memoize', () => {
	it('should return the correct value', () => {
		let t = new T(3);
		t.method(1, 2).should.equal(6);
	});

	it('should return the correct value the second time its called', () => {
		let t = new T(3);
		t.method(3, 4);
		t.method(3, 4).should.equal(10);
	});

	it('should work accross multiple instances', () => {
		let t0 = new T(0);
		let t1 = new T(1);
		t0.method(1, 1).should.equal(2);
		t1.method(1, 1).should.equal(3);
	});
});
