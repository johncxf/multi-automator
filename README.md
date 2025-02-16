# Multi-automator

[API](./doc/API/README.md) | [CHANGELOG](./doc/Changelog.md)

`multi-automator` 是一款 UI 自动化测试框架，旨在整合多端 UI 自动化操控能力，提供统一多端的 API 操控能力。

支持情况：

- Web：基于 [puppeteer](https://github.com/puppeteer/puppeteer) 实现对 web 设备的操控；
- iOS：基于 [WebDriverAgent](https://github.com/appium/WebDriverAgent) 实现对 iOS 设备的操控；
- Android：待支持；

## Getting Started | 快速开始

### Requirements | 环境要求

- [环境配置](./doc/ENV/README.md)

### Installation | 安装

```sh
$ npm i multi-automator
```

## Usage | 用法

通过创建一个设备实例来对设备进行操控，目前支持直接对设备进行操控和对设备元素进行操控。

#### Example

实例化设备，进行跳转、获取DOM、设备截屏等操控：

**进行设备操控示例：**

```javascript
const automator = require('multi-automator');

(async () => {
    // 获取在连设备
    const devicesList = await automator.devices(deviceType)
    // 启动参数
    const launchOptions = {
        deviceType: 'iOS', // 支持：web、iOS、android
        deviceId: Object.keys(devicesList)[0],, // 不传，则默认连接第一个设备
        // iOS 启动参数
        iOSOptions: {
        	wdaProjPath: '~/WebDriverAgent/WebDriverAgent.xcodeproj', // 必传
        },
    };
    // 启动设备
    let device = await automator.launch(launchOptions)
    try {
        // 启动 APP - Web 不支持
        await device.launchApp('com.apple.mobilesafari')
        // URL 页面跳转
        await device.goto('https://blog.yiqiesuifeng.cn/');
        // 获取页面 DOM
        await device.source({ path: 'page.xml' });
        // 设备截屏
        await device.screenshot({ path: 'page.png' });
        // 根据坐标点击
        await device.tap(330, 766);
        ...
    } catch(err) {
        throw new Error(err);
    } finally {
        await automator.time.delay(3000);
        // 关闭设备
        await device.close();
    }
})();
```

**进行元素操控示例：**

```javascript
const automator = require('multi-automator');

(async () => {
    ...
    try {
        // 元素截图
        await device.$x('//XCUIElementTypeToolbar[@name="BottomBrowserToolbar"]').then(async (eles) => {
            if (eles.length > 0) {
                let screenshot = await eles[0].screenshot(`${TMP_DIR}/element-screenshot.png`);
                expect(screenshot).to.be.an.instanceOf(Buffer);
            }
        });
        // 元素点击
        await device.$x('//XCUIElementTypeButton[@name="URL"] | //XCUIElementTypeTextField[@label="地址"]').then(async (eles) => {
            if (eles.length > 0) {
                await eles[0].tap();
            }
        });
        // input 输入
        await device.$x('//XCUIElementTypeButton[@name="URL"] | //XCUIElementTypeTextField[@label="地址"]').then(async (eles) => {
            if (eles.length > 0) {
                await eles[0].input('https://www.baidu.com');
            }
        });
        ...
    } catch(err) {
        throw new Error(err);
    } finally {
        await automator.time.delay(3000);
        // 关闭设备
        await device.close();
    }
})();
```

**更多用法参考：[API](./doc/API/README.md)**

## Contributing | 贡献



## FAQ

