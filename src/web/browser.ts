/**
 * @desc: 浏览器操作
 * @author: john_chen
 * @date: 2023.04.03
 */
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
    }
} as const;

/**
 * 平台类型
 */
export type Platform = 'linux' | 'mac' | 'mac_arm' | 'win32' | 'win64';

/**
 * 检测 Chromium 安装
 * 
 * @returns {Promise<string>}
 */
export async function checkChromium(platform?: Platform): Promise<string> {
    logger.info('[browser.checkChromium]');
    platform = platform || 'mac_arm';
    // @ts-ignore
    let browserConfig = browserConfigMap[platform];
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
