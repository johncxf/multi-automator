/**
 * @desc:
 * @author: john_chen
 * @date: 2023.04.01
 */
import { DevicesMap } from './types';
import Device from './Device';
import * as web from './web/index';
import * as iOS from './iOS/index';

export const DEVICE_TYPE_MAP = ['web', 'ios'];

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
    /**
     * iOS 初始化参数
     */
    iOSOptions?: iOS.InitOptions;
}

/**
 * 检查设备连接，若未输入设备ID，则返回当前连接的第一个设备ID
 *
 * @param deviceType 设备类型
 * @param deviceId 设备ID
 * @returns Promise<string>
 */
async function checkDeviceConnect(deviceType: string, deviceId?: string): Promise<string> {
    const deviceList = await devices(deviceType);
    const deviceIds = Object.keys(deviceList);
    if (deviceIds.length === 0) {
        throw new Error('未发现连接设备');
    }
    if (undefined === deviceId) {
        deviceId = deviceIds[0];
    } else {
        if (deviceIds.indexOf(deviceId) === -1) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
    }
    return deviceId
}

/**
 * 初始化设备
 *
 * @param options
 * @returns <Promise<device>>
 */
export async function launch(options?: LaunchOptions): Promise<Device> {
    options = options || {};
    let { deviceId, deviceType = 'web', webOptions, iOSOptions } = options;
    deviceType = deviceType?.toLocaleLowerCase();
    if (-1 === DEVICE_TYPE_MAP.indexOf(deviceType)) {
        throw new Error(`暂不支持该类型设备：${deviceType}`);
    }
    let device = new Device({ deviceId, deviceType });
    if ('web' === deviceType) {
        webOptions = webOptions || {};
        let webHandler = await web.init(webOptions);
        await device.init(webHandler);
    } else if ('ios' === deviceType) {
        if (undefined === iOSOptions) {
            throw new Error('参数对象 iOSOptions 不能为空');
        }
        if (undefined === iOSOptions.wdaProjPath) {
            throw new Error('参数 iOSOptions.wdaProjPath 不能为空');
        }
        deviceId = await checkDeviceConnect(deviceType, deviceId);
        let iOSHandler = await iOS.init(deviceId, iOSOptions);
        await device.init(iOSHandler);
    }
    return device;
}

/**
 * 获取设备列表
 *
 * @param deviceType 设备类型
 * @returns Promise<DevicesMap>
 */
export async function devices(deviceType: string): Promise<DevicesMap> {
    deviceType = deviceType.toLocaleLowerCase();
    if ('ios' === deviceType) {
        return await iOS.devices();
    } else if ('android' === deviceType) {
        // 待支持
        throw new Error(`Not support this os: ${deviceType}`);
    } else {
        throw new Error(`Not support this os: ${deviceType}`);
    }
}