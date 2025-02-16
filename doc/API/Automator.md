# class: Automator

Automator 模块提供启动设备的方法，以及常用的一些类库。

## Example

```javascript
const automator = require('multi-automator');

// 获取在线设备列表 - android|iOS
const devicesList = await automator.devices('iOS');
console.log(devicesList)

// 启动设备
let device = await automator.launch(options);

// 设备操作
await device.home();
```

## Function

#### automator.devices(deviceType)

获取设备列表

- `deivceType`：设备类型（ios|android|web）
- `returns`: <Promise<DevicesMap\>>

#### automator.launch([options])

启动设备

- `options` <object\> ：
  - `deviceId` <string\> 设备ID，不传默认连接获取到的第一个设备（deviceType=web 时不需要传）
  - `deviceType` <string\> 设备类型，默认 web
  - `webOptions` <object\> deviceType=web 相关参数：
    - `browserPath` <string\> 浏览器启动路径
    - `headless` <boolean\> 无头模式
    - `cookies` <array<object\>\> cookie 信息
    - `emulate` <boolean\> 是否启动模拟器
    - `args` <array<string\>>：对应 puppeteer.launch 中的 `args` 参数
    - `ignoreDefaultArgs` <array<string\>>：对应 puppeteer.launch 中的 `ignoreDefaultArgs` 参数
      - 参考：https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
  - `iOSOptions`  <object\> deviceType=iOS 相关参数：
    - `wdaProjPath`: <string\> 本地 WebDriverAgent.xcodeproj 项目路径
- `returns`: <Promise<[Device](./Device.md)\>\> 
