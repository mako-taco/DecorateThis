import debounce from 'debounce';

class T {
	constructor(){
		this.count = 0;
	}

	@debounce(30)
	highRateFn() {
		this.count++;
	}

	@debounce(20)
	decrementFn() {
		this.count--;
	}
}

describe('debounce', () => {
	it('should debounce functions called within the time window', (done) => {
		const t = new T();
		let interval = setInterval(() => t.highRateFn(), 0);
		setTimeout(() => {
			clearInterval(interval);
			setTimeout(() => {
				try {
					t.count.should.equal(1);
				}
				catch(err) {
					done(err);
				}

				done();
			}, 40);
		}, 10);
	});

	it('should be instance specific', (done) => {
		const t0 = new T();
		const t1 = new T();

		t0.highRateFn();
		t1.highRateFn();

		setTimeout(() => {
			try {
				t0.count.should.equal(1);
				t1.count.should.equal(1);
			}
			catch(err) {
				done(err);
			}

			done();
		}, 40);
	});

	it('should work with multiple debounced methods in one class', (done) => {
		const t = new T();

		t.highRateFn();
		t.decrementFn();

		setTimeout(() => {
			try {
				t.count.should.equal(0);
			}
			catch(err) {
				return done(err);
			}

			done();
		}, 40);
	});
});
