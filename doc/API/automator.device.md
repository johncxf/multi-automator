# Device class

Device 提供了设备操控相关的方法。

## Example

```javascript
// 进行设备截图
await device.screenshot({ path: 'page.png' });
```

## Function

#### device.goto(path)

进行页面跳转操作

- `path` <string/> 页面路径

- `returns` <Promise\>

#### device.source([options])

获取设备元素DOM树

- `options` <Object\> 可选配置：
  - `path` <string/> DOM保存路径
- `returns` <Promise<string\>\>

#### device.$x(expression, [options])

获取设备元素DOM树

- `expression` <string\> XPATH 表达式
- `options` <Object\> 可选配置：
  - `loop` <number/> 轮循次数，默认 3 次
  - `duration` <number/> 轮询时间间隔（ms），默认 1000
  - `loop` <number/> 查询异常重试次数，默认 3
- `returns` <Promise<string\>\>

#### device.screenshot([options])

对设备屏幕进行截图

- `options` <Object\> 可选配置：
  - `path` <string/> 截图保存路径
- `returns` <Promise[Buffer|String]>\>

#### device.getScreenSize()

获取设备屏幕尺寸

`returns` <Promise<object\>\>

- `width` <number\> 宽度
- `height` <number\> 高度

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

#### device.version()

获取设备版本信息（web：浏览器版本）

`returns` <Promise<string\>\>

#### device.close()

关闭设备

`returns` <Promise\>
