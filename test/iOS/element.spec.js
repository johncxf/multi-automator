/**
 * @desc: iOS Element operation unit test
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


describe('[iOS] Element', function () {
    let device;
    let devicesList = [];
    before(async () => {
        device = await automator.launch({
            deviceType: deviceType,
            deviceId: Object.keys(devicesList)[0],
            iOSOptions: {
                wdaProjPath: wdaProjectPath
            }
        });
    });

    describe('device.$x', () => {
        before(async () => {
            await device.launchApp(testPackageName)
        });

        it('element.boundingBox', async () => {
            await device.$x('//XCUIElementTypeToolbar[@name="BottomBrowserToolbar"]').then(async (eles) => {
                if (eles.length > 0) {
                    let boundingBox = await eles[0].boundingBox();
                    console.info(boundingBox);
                    expect(boundingBox).to.be.an.instanceOf(Object);
                }
            });
        });

        it('element.attribute', async () => {
            await device.$x('//XCUIElementTypeToolbar[@name="BottomBrowserToolbar"]').then(async (eles) => {
                if (eles.length > 0) {
                    let attribute = await eles[0].attribute('label');
                    expect(attribute).to.be.a('string');
                }
            });
        });

        it('element.screenshot', async () => {
            await device.$x('//XCUIElementTypeToolbar[@name="BottomBrowserToolbar"]').then(async (eles) => {
                if (eles.length > 0) {
                    let screenshot = await eles[0].screenshot(`${TMP_DIR}/ios-element-screenshot.png`);
                    expect(screenshot).to.be.an.instanceOf(Buffer);
                }
            });
        });

        it('element.tap', async () => {
            await device.$x('//XCUIElementTypeButton[@label="TabsButton"] | //XCUIElementTypeButton[@label="标签页"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].tap();
                }
            });
            await device.$x('//XCUIElementTypeButton[@label="完成"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].tap();
                }
            });
        });

        it('element.input', async () => {
            await device.$x('//XCUIElementTypeButton[@name="URL"] | //XCUIElementTypeTextField[@label="地址"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].tap();
                }
            });

            await device.$x('//XCUIElementTypeButton[@name="URL"] | //XCUIElementTypeTextField[@label="地址"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].input('https://www.baidu.com');
                }
            });
        });

        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    after(async () => {
        await device.close();
    });
});
