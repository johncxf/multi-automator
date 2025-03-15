/**
 * @desc:
 * @author: john_chen
 * @date: 2023.04.01
 */
import { DevicesMap } from './types';
import Device from './Device';
import * as web from './web/index';
import * as iOS from './iOS/index';
import * as android from './android/index';

export const DEVICE_TYPE_MAP = ['web', 'ios', 'android'];

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
    /**
     * Android 初始化参数
     */
    androidOptions?: android.InitOptions;
}

/**
 * 检查设备连接，若未输入设备ID，则返回当前连接的第一个设备ID
 *
 * @param deviceType 设备类型
 * @param deviceId 设备ID
 * @returns Promise<string>
 */
async function checkDeviceConnect(deviceType: string, deviceId?: string): Promise<string> {
    if ('web' === deviceType) {
        return 'web-device-id';
    }
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
    let { deviceId, deviceType = 'web', webOptions, iOSOptions, androidOptions } = options;
    deviceType = deviceType?.toLocaleLowerCase();
    if (-1 === DEVICE_TYPE_MAP.indexOf(deviceType)) {
        throw new Error(`暂不支持该类型设备：${deviceType}`);
    }
    deviceId = await checkDeviceConnect(deviceType, deviceId);
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
        let iOSHandler = await iOS.init(deviceId, iOSOptions);
        await device.init(iOSHandler);
    } else if ('android' === deviceType) {
        if (undefined === androidOptions) {
            throw new Error('参数对象 androidOptions 不能为空');
        }
        let androidHandler = await android.init(deviceId, androidOptions);
        await device.init(androidHandler);
    } else {
        throw new Error(`Not support this os: ${deviceType}`);
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
        return await android.devices();
    } else {
        throw new Error(`Not support this os: ${deviceType}`);
    }
}