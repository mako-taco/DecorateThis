'use strict';

import returns from 'returns';

class T {
    @returns(Number)
    returnsNum() {
        return 5;
    }

    @returns(Number)
    returnsNonNum() {
        return 'Hi!';
    }
}

describe('returns', () => {
    it('should throw an error when returning a bad type', () => {
        const t = new T();
        (() => {
            t.returnsNonNum();
        }).should.throw();
    });

    it('should not impact functions that return proper values', () => {
        const t = new T();
        t.returnsNum().should.equal(5);
    });
});
