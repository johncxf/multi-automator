# class: Device

Device 提供了设备操控相关的方法。Device 可以通过 [automator.launch](./Automator.md#automator.launch([options])) 方法创建。

## Example

```javascript
const automator = require('multi-automator');

let device = await automator.launch();

// 启动 APP - android|iOS
await device.launchApp(testPackageName)

// 跳转页面
await device.goto('https://blog.yiqiesuifeng.cn/');

// 进行设备截图
await device.screenshot({ path: 'page.png' });
```

## Function

#### device.source([options])

获取设备元素DOM树

- `options` <Object\> 可选配置：
    - `path` <string/> DOM保存路径
- `returns` <Promise<string\>\>

#### device.$x(expression, [options])

根据 xpath 获取设备元素操作对象列表

- `expression` <string\> XPATH 表达式
- `options` <Object\> 可选配置：
    - `loop` <number/\> 轮循次数，默认 3 次
    - `duration` <number> 轮询时间间隔（ms），默认 1000
    - `loop` <number/\> 查询异常重试次数，默认 3
- `returns` <Promise<Array<[ElementHandler](./ElementHandle.md)\>\>>

#### device.getScreenSize()

获取设备屏幕尺寸

`returns` <Promise<object\>\>

- `width` <number\> 宽度
- `height` <number\> 高度

#### device.goto(path)

进行页面跳转操作

- `path` <string\> 页面路径

- `returns` <Promise\>

#### device.tap(x, y)

对设备屏幕进行点击操作

- `x` <number\> 宽度
- `y` <number\> 高度
- `returns` <Promise\>

#### device.swipe(fx, fy, tx, ty, [options])

在设备屏幕进行页面滑动操作

- `fx` <number\> 起点横坐标
- `fy` <number\> 起点纵坐标
- `tx` <number\> 终点横坐标
- `ty` <number\> 终点纵坐标
- `returns` <Promise\>

#### device.longpress(x, y)

长按屏幕

- `x` <number\> 横坐标
- `y` <number\> 纵坐标
- `duration` <number\> 长按时间(ms)

#### device.screenshot([options])

对设备屏幕进行截图

- `options` <Object\> 可选配置：
    - `path` <string\> 截图保存路径
- `returns` <Promise[Buffer|String]>\>

#### device.close()

关闭设备

`returns` <Promise\>

#### device.home()

> 双端

home 键

#### device.appList()

> 双端

获取应用列表

- `returns` <Promise<AppInfo[]>\>

#### device.isInstalled(packageName)

> 双端

判断应用是否已安装

- `packageName` <string\> APP包名
- `returns`: Promise<boolean\>

#### device.install(packageName)

> 双端

安装应用

- `packageName` <string\> APP包名

#### device.uninstall(packageName)

> 双端

卸载应用

- `packageName` <string\> APP包名

#### device.launchApp(packageName)

> 双端

启动应用

- `packageName` <string\> APP包名

#### device.terminateApp(packageName)

> 双端

关闭应用

- `packageName` <string\> APP包名

#### device.relaunchApp(packageName)

> 双端

启动应用

- `packageName` <string\> APP包名

### iOS

#### device.activateApp(packageName)

> 仅 iOS

激活应用（先到home桌面，再打开该应用）

- `packageName`: APP包名

#### device.$(selectors, [options])

> 仅 Web

根据 CSS 选择器获取设备元素操作对象

- `selectors` <string\> CSS 选择器
- `options` <Object\> 可选配置：
  - `loop` <number\> 轮循次数，默认 3 次
  - `duration` <number\> 轮询时间间隔（ms），默认 1000
  - `loop` <number\> 查询异常重试次数，默认 3
- `returns` <Promise<Array<[ElementHandler](./ElementHandle.md)\>\>>

#### device.$$(selectors, [options])

> 仅 Web

根据 CSS 选择器获取设备元素操作对象列表

- `selectors` <string\> CSS 选择器
- `options` <Object\> 可选配置：
  - `loop` <number\> 轮循次数，默认 3 次
  - `duration` <number\> 轮询时间间隔（ms），默认 1000
  - `loop` <number\> 查询异常重试次数，默认 3
- `returns` <Promise<Array<[ElementHandler](./ElementHandle.md)\>\>>

#### device.version()

> 仅 Web

获取设备版本信息（web：浏览器版本）

`returns` <Promise<string\>\>

