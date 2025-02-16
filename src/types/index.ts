/**
 * @desc: common types
 * @author: john_chen
 * @date: 2025.01.12
 */

/**
 * 应用信息
 */
export interface AppInfo {
    // 应用包名
    appId: string;
    // 应用版本
    version: string;
    // 应用名称
    name: string;
}

/**
 * 设备状态
 */
export interface DeviceStatus {
    // 状态码
    status: number;
}
 
/**
 * 设备列表
 */
export interface DevicesMap {
    // 设备 UDID
    [udid: string]: DeviceStatus;
}

/**
 * 滑动选项
 */
export interface SwipeOptions {
    // 滑动时长（适用 android）
    duration?: number;
    // 起步按压时长（适用 iOS）
    startPressDuration?: number;
}
