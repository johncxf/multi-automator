/**
 * @desc: Browser Operate
 * @author: john_chen
 * @date: 2023.04.03
 */
import os from 'os';
import axios from 'axios';
import { tgz, zip } from 'compressing';
import { existsSync, writeFileSync } from 'fs';

import { dir, logger } from '../config';

/**
 * 浏览器配置集合
 */
const browserConfigMap = {
    mac_arm: {
        type: 'zip',
        path: `${dir.bin}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`,
        downloadUrl: 'https://storage.googleapis.com/chromium-browser-snapshots/Mac_Arm/1108766/chrome-mac.zip',
    },
    win64: {
        type: 'zip',
        path: `${dir.bin}/chrome-win/chrome.exe`,
        downloadUrl: 'https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/1108766/chrome-win.zip',
    }
} as const;

/**
 * 系统平台类型
 */
export enum SystemPlatform {
    LINUX = 'linux',
    MAC = 'mac',
    MAC_ARM = 'mac_arm',
    WIN32 = 'win32',
    WIN64 = 'win64',
}

/**
 * 获取系统平台类型
 *
 * @returns {SystemPlatform | undefined}
 */
export function getSystemPlatform(): SystemPlatform | undefined {
    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        return os.arch() === 'arm64'
          ? SystemPlatform.MAC_ARM
          : SystemPlatform.MAC;
      case 'linux':
        return SystemPlatform.LINUX;
      case 'win32':
        return os.arch() === 'x64' ||
          (os.arch() === 'arm64' && isWin11(os.release()))
          ? SystemPlatform.WIN64
          : SystemPlatform.WIN32;
      default:
        return undefined;
    }
}

/**
 * 判断是否是 windows11 系统
 *
 * @param {string} version 系统版本号
 * @returns {boolean}
 */
export function isWin11(version: string): boolean {
    const parts = version.split('.');
    if (parts.length > 2) {
      const major = parseInt(parts[0] as string, 10);
      const minor = parseInt(parts[1] as string, 10);
      const patch = parseInt(parts[2] as string, 10);
      return (
        major > 10 ||
        (major === 10 && minor > 0) ||
        (major === 10 && minor === 0 && patch >= 22000)
      );
    }
    return false;
}

/**
 * 检测 Chromium 安装
 * 
 * @returns {Promise<string>}
 */
export async function checkChromium(): Promise<string> {
    logger.info('[browser.checkChromium]');
    // 获取系统平台
    let platform = getSystemPlatform();
    platform = platform || SystemPlatform.MAC_ARM;
    logger.info(`[browser.checkChromium] system platform: ${platform}`);

    // @ts-ignore
    let browserConfig = browserConfigMap[platform];
    if (undefined === browserConfig) {
        throw new Error(`暂不支持该 ${platform} 系统自动安装浏览器`);
    }
    let { type, downloadUrl, path } = browserConfig;
    if (!existsSync(path)) {
        logger.warn('[browser.checkChromium] 未识别到指定浏览器，开始安装 Chromium');
        // 拉取 Chromium 压缩包
        let chromiumTarName = type === 'zip' ? 'Chromium.zip' : 'Chromium.tar.gz'
        let chromiumTarPath = `${dir.bin}/${chromiumTarName}`;
        await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'arraybuffer',
        })
        .then((res) => {
            writeFileSync(chromiumTarPath, res.data);
        })
        .catch((err) => {
            throw new Error(`获取 Chromium.tar.gz 失败：${err.message}`);
        });
        logger.info('[browser.checkChromium] Chromium 下载完成');

        // 解压
        if ('zip' === type) {
            await zip.uncompress(chromiumTarPath, dir.bin).catch((err) => {
                throw new Error(`解压 ${chromiumTarName} 失败：${err.message}`);
            });
        } else {
            await tgz.uncompress(chromiumTarPath, dir.bin).catch((err) => {
                throw new Error(`解压 ${chromiumTarName} 失败：${err.message}`);
            });
        }
        logger.info('[browser.checkChromium] Chromium 安装完成');
    }
    return path;
}
