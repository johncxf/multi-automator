/**
 * @desc: device unit test
 * @author: john_chen
 * @date: 2023.03.25
 */
/* globals describe, before, it, after */
const fs = require('fs');
const { expect } = require('chai');

const automator = require('../../lib/index')


describe('[Web] Device', function () {
    let device;
    before(async () => {
        device = await automator.launch({ headless: true });
    });

    describe('device.source', function() {
        let xml_path = 'web-unit.xml';
        before(async () => {
            await device.goto('https://blog.yiqiesuifeng.cn/');
        });

        it('options.format=string', async () => {
            let res = await device.source({ format: 'string' });
            expect(res).to.have.string('<!DOCTYPE html>');
        });

        it('options.path', async () => {
            await device.source({ path: xml_path });
            if (fs.existsSync(xml_path)) {
                expect(true).to.be.true;
            } else {
                expect(true).to.be.false;
            }
        });

        after(async () => {
            fs.unlinkSync(xml_path);
        });
    });

    describe('device.$x', function() {
        before(async () => {
            await device.goto('https://blog.yiqiesuifeng.cn/');
        });

        it('expression', async () => {
            let eles = await device.$x('//ul[contains(@class, "nav")]/li[2]');
            expect(eles.length).to.not.equal(0);
        });
    });

    after(async () => {
        await device.close();
    });
});
