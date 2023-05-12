# Multi-automator

[API](./doc/API/README.md) | [CHANGELOG](./doc/Changelog.md)

`multi-automator` 是一款 UI 自动化测试框架，旨在整合多端 UI 自动化操控能力，提供兼容多端的 API 能力。

目前，已基于 `puppteer` 实现了对 web 端操控能力。

## Getting Started | 快速开始

### Requirements | 环境要求

- NodeJS >= 18.0

### Installation | 安装

```sh
$ npm i multi-automator
```

## Usage | 用法

通过创建一个设备实例来对设备进行操控，目前支持直接对设备进行操控和对设备元素进行操控。

#### Example

实例化设备，进行跳转、获取DOM、设备截屏等操控：

```javascript
const automator = require('multi-automator');

(async () => {
    let device = await automator.launch({})
    try {
        // 页面跳转
        await device.goto('https://blog.yiqiesuifeng.cn/');

        // 获取页面 DOM
        await device.source({ path: 'page.xml' });

        // 设备截屏
        await device.screenshot({ path: 'page.png' });
    } catch(err) {
        throw new Error(err);
    } finally {
        await automator.time.delay(3000);
        // 关闭设备
        await device.close();
    }
})();
```

如需对设备元素进行操控，则需要先获取设备元素：

```javascript
const automator = require('multi-automator');

(async () => {
    let device = await automator.launch({})
    try {
        // 页面跳转
        await device.goto('https://blog.yiqiesuifeng.cn/');

        // 获取元素对象
        let navElements = await device.$x('//ul[contains(@class, "nav")]/li[2]');
        if (navElements.length > 0) {
            // 获取元素位置
            let eleBoundingBox = await navElements[0].boundingBox();
            console.log(`元素位置: ${eleBoundingBox}`);

            // 点击
            await navElements[0].tap();
        }
    } catch(err) {
        throw new Error(err);
    } finally {
        await automator.time.delay(3000);
        // 关闭设备
        await device.close();
    }
})();
```

更多用法参考：[API](./doc/API/README.md)

## Contributing | 贡献



## FAQ

