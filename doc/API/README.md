# API

## UI

- [Class: Automator](./Automator.md)
- [Class: Device](./Device.md)
- [Class: ElementHandle](./ElementHandle.md)

## Utils

- [Class: Time](./Utils/Time.md)
- [Class: File](./Utils/File.md)

## API 设备支持情况

### Device.xx

| Device API                              | Android | iOS  | Web  |
| --------------------------------------- | ------- | ---- | ---- |
| device.goto(path)                       | ✅       | ✅    | ✅    |
| device.source([options])                | ✅       | ✅    | ✅    |
| device.$x(expression, [options])        | ✅       | ✅    | ✅    |
| device.getScreenSize()                  | ✅       | ✅    | ✅    |
| device.tap(x, y)                        | ✅       | ✅    | ✅    |
| device.swipe(fx, fy, tx, ty, [options]) | ✅       | ✅    | ✅    |
| device.longpress(x, y)                  | ✅       | ✅    | ✅    |
| device.screenshot([options])            | ✅       | ✅    | ✅    |
| device.close()                          | ✅       | ✅    | ✅    |
| device.home()                           | ✅       | ✅    | ❌    |
| device.appList()                        | ✅       | ✅    | ❌    |
| device.isInstalled(packageName)         | ✅       | ✅    | ❌    |
| device.install(packageName)             | ✅       | ✅    | ❌    |
| device.uninstall(packageName)           | ✅       | ✅    | ❌    |
| device.launchApp(packageName)           | ✅       | ✅    | ❌    |
| device.terminateApp(packageName)        | ✅       | ✅    | ❌    |
| device.relaunchApp(packageName)         | ✅       | ✅    | ❌    |
| device.activateApp(packageName)         | ❌       | ✅    | ❌    |
| device.version()                        | ❌       | ❌    | ✅    |
| device.$(selectors, [options])          | ❌       | ❌    | ✅    |
| device.$$(selectors, [options])         | ❌       | ❌    | ✅    |

### Element.xx

| Element API                   | Android | iOS  | Web  |
| ----------------------------- | ------- | ---- | ---- |
| element.tap()                 | ✅       | ✅    | ✅    |
| element.screenshot([options]) | ✅       | ✅    | ✅    |
| element.input(text)           | ✅       | ✅    | ✅    |
| element.attribute()           | ✅       | ✅    | ✅    |
| element.boundingBox()         | ✅       | ✅    | ✅    |
| element.clear()               | ❌       | ✅    | ❌    |
| element.enter()               | ❌       | ❌    | ✅    |

