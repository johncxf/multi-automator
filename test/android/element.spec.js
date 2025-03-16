/**
 * @desc: Android Element operation unit test
 * @author: john_chen
 * @date: 2025.03.15
 */
/* globals describe, before, it, after */
const path = require('path');
const { expect } = require('chai');

const automator = require('../../lib/index');

const TMP_DIR = path.resolve(__dirname, '../../.tmp/');

const deviceType = 'android';
const testPackageName = 'com.taobao.taobao';


describe('[android] Element', function () {
    let device;
    let devicesList = [];
    before(async () => {
        devicesList = await automator.devices(deviceType);
        device = await automator.launch({
            deviceType: deviceType,
            deviceId: Object.keys(devicesList)[0],
            androidOptions: {
                connectType: 'usb'
            }
        });
        // console.info(device);
    });

    describe('device.$x', () => {
        before(async () => {
            await device.relaunchApp(testPackageName)
        });

        it('element.boundingBox', async () => {
            await device.$x('//node[@resource-id="com.taobao.taobao:id/search_view"]').then(async (eles) => {
                if (eles.length > 0) {
                    let boundingBox = await eles[0].boundingBox();
                    console.info(boundingBox);
                    expect(boundingBox).to.be.an.instanceOf(Object);
                    expect(boundingBox.x).to.be.a('number');
                    expect(boundingBox.y).to.be.a('number');
                    expect(boundingBox.width).to.be.a('number');
                    expect(boundingBox.height).to.be.a('number');
                }
            });
            // await device.source({path: path.resolve(TMP_DIR, 'android-source.xml')});
        });

        it('element.attribute', async () => {
            await device.$x('//node[@resource-id="com.taobao.taobao:id/search_view"]').then(async (eles) => {
                // console.info(eles);
                if (eles.length > 0) {
                    let text = await eles[0].attribute('class');
                    // console.info(text);
                    expect(text).to.be.a('string');
                }
            });
        });

        it('device.screenshot', async () => {
            await device.$x('//node[@content-desc="搜索" and @class="android.widget.FrameLayout"]').then(async (eles) => {
                if (eles.length > 0) {
                    let res = await eles[0].screenshot(`${TMP_DIR}/android-element-screenshot.png`);
                    expect(res).to.be.an.instanceOf(Buffer);
                }
            });
            // await device.handler.atx.deviceInfo();
            // await device.handler.atx.screenshot(); 
        });

        it('element.tap', async () => {
            await device.$x('//node[@content-desc="我的淘宝"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].tap();
                }
            });
            await device.$x('//node[@content-desc="首页"]').then(async (eles) => {
                if (eles.length > 0) {
                    await eles[0].tap();
                }
            });
        });

        it('element.input', async () => {
            await device.$x('//node[@resource-id="com.taobao.taobao:id/search_view"]/node/node/node/node[@index="1"]/node[@index="2"]').then(async (eles) => {
                if (eles.length > 0) {
                    // await eles[0].tap();
                    await eles[0].input('耐克');
                    await device.handler.enter();
                }
            });
            await automator.time.delay(6000);
        });

        after(async () => {
            await device.terminateApp(testPackageName)
        });
    });

    after(async () => {
        await device.close();
    });
});
