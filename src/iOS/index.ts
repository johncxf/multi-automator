/**
 * @desc: iOS Entry
 * @author: john_chen
 * @date: 2024.12.29
 */
import { DevicesMap } from '../types';
import { logger } from '../config';
import IOSHandler from './Handler';
import * as idevice from './idevice';

/**
 * Init Options
 */
export interface InitOptions {
    wdaProjPath: string
}

/**
 * 初始化
 *
 * @param {string} udid 设备 UDID
 * @param {object} options 初始化参数
 * @returns Promise<IOSHandler>
 */
export async function init(udid: string, options: InitOptions): Promise<IOSHandler> {
    logger.info(`[iOS.init] udid: ${udid}, options: ${JSON.stringify(options)}`);
    const { wdaProjPath } = options;
    let iOSHandler = new IOSHandler(udid, wdaProjPath);
    await iOSHandler.init();
    return iOSHandler;
}

/**
 * Get iOS devices info
 *
 * @returns Promise<DevicesMap>
 */
export async function devices(): Promise<DevicesMap> {
    return await idevice.devices();
}
