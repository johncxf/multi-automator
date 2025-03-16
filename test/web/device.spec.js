/**
 * @desc: device unit test
 * @author: john_chen
 * @date: 2023.03.25
 */
/* globals describe, before, it, after */
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const automator = require('../../lib/index')

const TMP_DIR = path.resolve(__dirname, '../../.tmp/');


describe('[Web] Device', function () {
    let device;
    before(async () => {
        device = await automator.launch({
            deviceType: 'web',
            webOptions: {
                headless: true
            }
        });
        await device.goto('https://blog.yiqiesuifeng.cn/');
    });

    it('device.getScreenSize', async () => {
        let size = await device.getScreenSize();
        console.log(`page screen size: ${JSON.stringify(size)}`);
        expect(size).to.not.be.empty;
    });

    it('device.version', async () => {
        let version = await device.version();
        console.log(`browser version: ${version}`);
        expect(version).to.not.be.empty;
    });

    it('device.screenshot', async () => {
        let res = await device.screenshot({ path: path.resolve(TMP_DIR, 'web-device.png') });
        // console.log(res);
        expect(res).to.not.be.empty;

        if (fs.existsSync(path.resolve(TMP_DIR, 'web-device.png'))) {
            expect(true).to.be.true;
        } else {
            expect(true).to.be.false;
        }
    });

    describe('device.source', function() {
        let xml_path = path.resolve(TMP_DIR, 'web-unit.xml');
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
