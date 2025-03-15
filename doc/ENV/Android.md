# Android 设备配置

## 开发者模式

进入「设置」，打开「开发者模式」，并打开以下配置：

- 打开 **`USB 调试`**
- 打开**`保持亮屏幕`**（充电时屏幕不休眠）
- 打开**`USB安装`**
- 打开 **`默认 USB 配置`** 选择 **`传输文件（MTP）`**
- 打开 **`USB 调试（安全设置）- 允许通过 USB 调试修改权限或模拟点击`**（小米机型）

## 安装驱动 APP

#### UIAutomator

分别下载两个APK包，下载后安装到对应android设备：

- [app-uiautomator.apk](https://github.com/openatx/android-uiautomator-server/releases/download/2.3.3/app-uiautomator.apk)
- [app-uiautomator-test.apk](https://github.com/openatx/android-uiautomator-server/releases/download/2.3.3/app-uiautomator-test.apk)

```sh
$ adb install app-uiautomator.apk
$ adb install app-uiautomator-test.apk
```

分别下载两个jar包，下载后push到对应android设备：：

- [bundle.jar](https://github.com/openatx/android-uiautomator-jsonrpcserver/releases/download/v0.1.6/bundle.jar)
- [uiautomator-stub.jar](https://github.com/openatx/android-uiautomator-jsonrpcserver/releases/download/v0.1.6/uiautomator-stub.jar)

```sh
$ adb push bundle.jar /data/local/tmp/
$ adb push uiautomator-stub.jar /data/local/tmp/
```

#### ADBKeyBoard

下载 [ADBKeyBoard](https://github.com/senzhk/ADBKeyBoard/blob/master/ADBKeyboard.apk) 包，下载后安装到对应android设备：

```sh
$ adb install ADBKeyboard.apk
```

#### minicap&minitouch