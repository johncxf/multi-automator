/**
 * @desc: unit test
 * @author: john_chen
 * @date: 2023.03.25
 */
/* globals describe, it */
const { expect } = require('chai');


describe('[multi-automator]', function () {
    it('launch', async () => {
        let ret = 'test';
        expect(ret).to.equal('test');
    });
});