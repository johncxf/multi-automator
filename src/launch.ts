/**
 * @desc:
 * @author: john_chen
 * @date: 2023.04.01
 */
import Device from './Device';
import * as web from './web/index';

export const DEVICE_TYPE_MAP = ['web'];

/**
 * Launch Options
 */
export interface LaunchOptions {
    /**
     * 设备ID
     */
    deviceId?: string;
    /**
     * 设备类型
     */
    deviceType?: string;
    /**
     * web 初始化配置
     */
    webOptions?: object;
}

/**
 * 初始化设备
 *
 * @param options
 * @returns <Promise<device>>
 */
export async function launch(options?: LaunchOptions): Promise<Device> {
    options = options || {};
    let { deviceId, deviceType = 'web', webOptions } = options;
    deviceType = deviceType?.toLocaleLowerCase();
    if (-1 === DEVICE_TYPE_MAP.indexOf(deviceType)) {
        throw new Error(`暂不支持该类型设备：${deviceType}`);
    }
    let device = new Device({ deviceId, deviceType });
    if ('web' === deviceType) {
        webOptions = webOptions || {};
        let webHandler = await web.init(webOptions);
        await device.init(webHandler);
    }
    return device;
}
