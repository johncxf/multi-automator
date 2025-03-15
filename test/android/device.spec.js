/**
 * @desc: Device operation unit test
 * @author: john_chen
 * @date: 2025.02.15
 */
/* globals describe, before, it, after */
const path = require('path');
const { expect } = require('chai');

const automator = require('../../lib/index');

const TMP_DIR = path.resolve(__dirname, '../../.tmp/');

const deviceType = 'android';
const testPackageName = 'com.taobao.taobao';


describe('[android] Device', function () {
    let device;
    let devicesList = [];
    before(async () => {
        devicesList = await automator.devices(deviceType);
        // console.log(devicesList);
        expect(devicesList).to.not.be.empty;

        device = await automator.launch({
            deviceType: deviceType,
            deviceId: Object.keys(devicesList)[0],
            androidOptions: {
                connectType: 'usb'
            }
        });
    });

    it('device.home', async () => {
       await device.home();
    });

    it('device.appList', async () => {
        let appList = await device.appList();
        // console.log(appList);
        expect(appList).to.not.be.empty;
        expect(appList.length).to.greaterThan(1);
    });

    it('device.appInfo', async () => {
        let appInfo = await device.appInfo('com.github.uiautomator');
        // console.log(appInfo);
        expect(appInfo).to.not.be.empty;
    });

    it('device.app', async () => {
        // 启动 APP 
        await device.launchApp(testPackageName)
        // 终止 APP
        await device.terminateApp(testPackageName)
    });

    it('device.source', async () => {
        const domSource = await device.source({path: path.resolve(TMP_DIR, 'android-source.xml')});
        // console.info(domSource);
        // const domSource = await device.source();
        expect(domSource).to.not.be.empty;
    });

    it('device.screenshot', async () => {
        const screenshot = await device.screenshot({path: path.resolve(TMP_DIR, 'android-screenshot.png')});
        // const screenshot = await device.screenshot();
        // console.info(screenshot);
        expect(screenshot).to.not.be.empty;
    });

    it('device.getScreenSize', async () => {
        const screenSize = await device.getScreenSize();
        // console.info(screenSize);
        expect(screenSize).to.not.be.empty;
    });

    describe('device.tap', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });
        it('device.tap', async () => {
            // await device.source({path: path.resolve(TMP_DIR, 'android-source.xml')});
            await device.tap(979,2678);
        });
        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    describe('device.longpress', () => {
        before(async () => {
            await device.home();
        });
        it('device.longpress', async () => {
            await device.longpress(117, 730);
        });
        after(async () => {
            await device.home();
        });
    });

    describe('device.swipe', () => {
        before(async () => {
            await device.relaunchApp(testPackageName)
        });
        it('device.swipe', async () => {
            await device.swipe(500, 1000, 3000, 1000, { duration: 1000 });
            await automator.time.delay(3000);
        });
        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    describe('device.handler', () => {
        before(async () => {
            await device.home();
        });

        it('device.handler.info', async () => {
            const info = await device.handler.info();
            // console.log(info);
            expect(info).to.not.be.empty;
        });
    });

    it('device.goto', async () => {
        await device.goto('https://www.baidu.com');
    });

    it('device.isInstalled', async () => {
        expect(await device.isInstalled('com.github.uiautomator')).to.be.true;
    });

    after(async () => {
        await device.close();
    });
});
