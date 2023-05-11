# Automator

Automator 模块提供启动设备的方法，以及常用的一些类库

## Example

```javascript
const automator = require('multi-automator');

let device = await automator.launch();
await device.version();
```

## Function

#### automator.launch([options])

启动设备

- `options` <object\> ：
  - `deviceId` <string\> 设备ID，deviceType=web 时不需要传
  - `deviceType` <string\> 设备类型，默认 web
  - `webOptions` <object\> deviceType=web 相关参数：
    - `browserPath` <string\> 浏览器启动路径
    - `headless` <boolean\> 无头模式
    - `cookies` <array<object\>\> cookie 信息
    - `emulate` <boolean\> 是否启动模拟器
    - `args` <array<string\>>：对应 puppeteer.launch 中的 `args` 参数
    - `ignoreDefaultArgs` <array<string\>>：对应 puppeteer.launch 中的 `ignoreDefaultArgs` 参数
      - 参考：https://github.com/GoogleChrome/chrome-launcher/blob/main/docs/chrome-flags-for-tools.md
- `returns` <Promise<Device\>\> 

