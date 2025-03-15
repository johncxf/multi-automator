# ENV

- Android | iOS：目前仅支持 `MacOS` 环境
- Web：MacOS and Windows

## MacOS

### 基础环境

#### Homebrew

```sh
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
安装如有问题，可参考：https://blog.yiqiesuifeng.cn/archives/201/

#### NodeJS

- NodeJS >= 18.17.0

具体安装步骤略，建议使用`nvm`等工具，`nvm`安装参考：https://blog.yiqiesuifeng.cn/archives/167/

#### Sharp

根据自己 MAC 设备型号安装依赖：

```sh
# ARM 处理器（M 系列）
npm install --cpu=arm64 --os=darwin sharp

# Intel 处理器
npm install --cpu=x64 --os=darwin sharp
```

参考：https://sharp.pixelplumbing.com/install#cross-platform

### 驱动 Web 浏览器

> 不需要配置，默认会自动安装 chromium 进行执行
>

### 驱动 iOS 设备

#### libimobiledevice

```sh
# 安装
$ brew install libimobiledevice

# 查看已连接的所有设备号
$ idevice_id -l
```

#### ideviceinstaller

```sh
$ brew install ideviceinstaller
```

#### WDA

安装配置参考：https://blog.csdn.net/John_rush/article/details/145502059

### 驱动 Android 设备

#### ADB

```sh
# homebrew 安装
$ brew install android-platform-tools

# 直接下SDK安装
# 1、下载并解压：https://developer.android.com/tools/releases/platform-tools?hl=zh-cn
# 2、设置环境变量 - 地址改成自己本地的解压地址
$ echo 'export PATH="$PATH:$HOME/OpenSource/platform-tools"' >> ~/.zshrc
$ source source ~/.zshrc

# 验证是否安装成功
$ adb version
```

#### Atx-agent

从 https://github.com/openatx/atx-agent/releases下载以`linux_armv7.tar.gz`结尾的二进制包。绝大部分手机都是linux-arm架构的。

解压出`atx-agent`文件并进入解压目录，然后打开控制台执行：

```sh
$ adb push atx-agent /data/local/tmp
$ adb shell chmod 755 /data/local/tmp/atx-agent
```

具体查看 ATX 文档：https://github.com/openatx/atx-agent?tab=readme-ov-file#installation

#### Android 设备配置

参考：[android 设备配置](./Android.md)



