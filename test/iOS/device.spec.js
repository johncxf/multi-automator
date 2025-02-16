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

const wdaProjectPath = '~/OpenSource/WebDriverAgent/WebDriverAgent.xcodeproj';
const deviceType = 'iOS';
const testPackageName = 'com.apple.mobilesafari';


describe('[iOS] Device', function () {
    let device;
    let devicesList = [];
    before(async () => {
        devicesList = await automator.devices('iOS');
        expect(devicesList).to.not.be.empty;

        device = await automator.launch({
            deviceType: deviceType,
            deviceId: Object.keys(devicesList)[0],
            iOSOptions: {
                wdaProjPath: wdaProjectPath
            }
        });
    });

    it('device.home', async () => {
        await device.home();
    });

    it('device.appList', async () => {
        const appList = await device.appList();
        expect(appList).to.not.be.empty;
        expect(appList.length).to.greaterThan(1);
    });

    it('device.app', async () => {
        // 启动 APP 
        await device.launchApp(testPackageName)
        // 终止 APP
        await device.terminateApp(testPackageName)
        // 激活 APP
        await device.activateApp(testPackageName)
    });

    it('device.source', async () => {
        // const domSource = await device.source({path: path.resolve(__dirname, 'source.json')});
        const domSource = await device.source();
        // console.info(source);
        expect(domSource).to.not.be.empty;
    });

    it('device.screenshot', async () => {
        // const screenshot = await device.screenshot({path: path.resolve(__dirname, 'screenshot.png')});
        const screenshot = await device.screenshot();
        // console.info(screenshot);
        expect(screenshot).to.not.be.empty;
    });

    it('device.getScreenSize', async () => {
        const screenSize = await device.getScreenSize();
        console.info(screenSize);
        expect(screenSize).to.not.be.empty;
    });

    describe('device.tap', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });
        it('device.tap', async () => {
            await device.tap(330, 766);
            await device.tap(335, 777);
            await device.source({path: path.resolve(TMP_DIR, 'source.json')});
        });
        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    describe('device.longpress', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });
        it('device.longpress', async () => {
            await device.longpress(117, 730);
        });
        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    describe('device.swipe', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });
        it('device.swipe', async () => {
            await device.swipe(100, 300, 100, 700, { startPressDuration: 1000 });
        });
        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    describe('device.handler', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });
        
        it('device.handler.getScreenInfo', async () => {
            const screenInfo = await device.handler.getScreenInfo();
            expect(screenInfo).to.not.be.empty;
        });

        it('device.handler.deactivateApp', async () => {
            await device.handler.deactivateApp();
        });

        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    it('device.goto', async () => {
        await device.goto('https://www.baidu.com');
    });

    it('device.isInstalled', async () => {
        expect(await device.isInstalled('com.apple.Pages')).to.be.true;
    });

    after(async () => {
        await device.close();
    });
});
