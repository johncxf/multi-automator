# ENV

- Android|iOS：目前仅支持 `MacOS` 环境
- Web：MacOS and Windows

## MacOS

### 基础环境

#### Homebrew

```sh
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
安装如有问题，可参考：https://blog.yiqiesuifeng.cn/archives/201/

#### NodeJS

- NodeJS >= 18.0

具体安装步骤略，建议使用`nvm`等工具，`nvm`安装参考：https://blog.yiqiesuifeng.cn/archives/167/

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

#### 安装 ideviceinstaller

```sh
$ brew install ideviceinstaller
```

#### 安装 WDA

安装配置参考：https://blog.csdn.net/John_rush/article/details/145502059

### 驱动 Android 设备

> 待支持
>

