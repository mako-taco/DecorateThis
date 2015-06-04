'use strict';

import promises from 'promises';

class T {
    @promises(Number)
    promisesNum() {
        return new Promise(resolve => {
            resolve(5);
        });
    }

    @promises(Number)
    promisesNonNum() {
        return new Promise(resolve => {
            resolve('Hi!');
        });
    }
}

describe('promises', () => {
    it('should throw an error when resolving a bad type', (done) => {
        const t = new T();
        t.promisesNonNum().then(() => {
            done(new Error('The promises was not rejected'));
        }, () => {
            done();
        });

    });

    it('should not impact functions that resolve proper values', (done) => {
        const t = new T();
        t.promisesNum().then(() => {
            done();
        }, (err) => {
            try {
                err.message.should.equal('promisesNonNum type mismatch: expected `promised value` to be `Number`, got `Hi!`');
            }
            catch(err) {
                done(err);
            }

            done();
        });
    });
});
