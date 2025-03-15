# class: ElementHandle

ElementHandle 提供了设备元素操控的方法，ElementHandle 可以通过 [device.$x](./Device.md#device.$x(expression, [options])) 、[device.$$](./Device.md#device.$$(selectors, [options])) 、[device.$](./Device.md#device.$(selectors, [options])) 方法创建。

## Example

```javascript
// 获取元素对象
let navElements = await device.$x('//ul[contains(@class, "nav")]/li[2]');

// 点击元素
await navElements[0].tap();
```

## Function

#### element.tap()

对设备元素进行点击操作

- `returns` <Promise\>

#### element.screenshot([options])

对设备元素进行屏幕截图操作

- `options` <Object\> 可选配置：
  - `path` <string/> 截图保存路径
- `returns` <Promise[Buffer|String]>\>

#### element.input(text)

对设备元素执行输入操作

- `text` <string\> 要输入的文本
- `returns` <Promise\>

#### element.attribute()

获取设备`property`属性值

- `returns` <Promise<string\>\>

#### element.boundingBox()

获取设备元素的位置信息

- `returns` <Promise<object\>\>
  - `x` <number\> 元素的 x 坐标（以像素为单位）。
  - `y` <number\> 元素的 y 坐标（以像素为单位）。
  - `width` <number\> 元素的像素宽度。
  - `height` <number\> 元素的像素高度。

#### element.clear()

> 仅支持 iOS

对设备元素执行清空操作（input框）

- `returns` <Promise\>

#### element.enter()

> 仅支持 Web

对设备元素执行回车操作

- `returns` <Promise\>

