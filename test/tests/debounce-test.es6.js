import debounce from 'debounce';

class T {
	constructor(){
		this.count = 0;
	}

	@debounce(30)
	highRateFn() {
		this.count++;
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
});
