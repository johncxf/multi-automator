/**
 * @desc: android Entry
 * @author: john_chen
 * @date: 2025.02.22
 */
import * as adb from './adb';
import AndroidHandler from './Handler';
import { logger } from '../config';
import { DevicesMap } from "../types";


/**
 * Android 初始化参数
 */
export interface InitOptions {
    connectType: 'usb' | 'wifi';
}

export async function init(deviceId: string, options: InitOptions) {
    logger.info(`[android.init] udid: ${deviceId}`);
    let androidHandler = new AndroidHandler(deviceId, options.connectType);
    await androidHandler.init();
    return androidHandler;
}

export async function devices(): Promise<DevicesMap> {
    return await adb.devices();
}