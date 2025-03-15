/**
 * @desc: adb
 * @author: john_chen
 * @date: 2025.02.22
 */
import adbkit from 'bat-adbkit';
import { DevicesMap, ScreenSize } from '../types';
import { logger } from '../config';

const ADB_PATH = 'adb';

let adb: ReturnType<typeof adbkit.createClient> | null = null;
let ipMap: Record<string, string> = {};
let screenSizeMap: Record<string, ScreenSize> = {};


// 错误处理函数
function handleError(message: string, err: unknown): void {
    throw new Error(`${message}: ${(err as Error).message}`);
}

/**
 * 初始化 adb client
 *
 * @param {string} bin
 * @param {string} host
 * @param {number} port
 * @returns {Object} adb
 */
export function init(bin = ADB_PATH, host = '127.0.0.1', port = 5037): ReturnType<typeof adbkit.createClient> {
    adb = adbkit.createClient({ bin, host, port });
    return adb;
}

/**
 * 获取 adb client
 *
 * @returns {Object} adb
 */
export function getAdb(): ReturnType<typeof adbkit.createClient> | null {
    if (adb === null) {
        init();
    }
    return adb;
}

/**
 * 执行 shell 命令
 */
export async function shell(deviceId: string, command: string): Promise<string> {
    try {
        const adbClient = getAdb();
        if (!adbClient) {
            throw new Error('ADB client not initialized');
        }
        const res = await adbClient.shell(deviceId, command).then(adbkit.util.readAll);
        return (await res.toString()).trim();
    }
    catch (err: unknown) {
        throw new Error(`adb shell fail: ${deviceId}, ${command}, ${(err as Error).message}`);
    }
};

/**
 * 异步执行 shell 命令
 */
export async function shellAsync(deviceId: string, command: string): Promise<any> {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    return await adbClient.shell(deviceId, command);
}

/**
 * 获取当前在连的设备列表
 *
 * @return {Promise<DevicesMap>} deviceConnectMap
 */
export async function devices(): Promise<DevicesMap> {
    try {
        const adbClient = getAdb();
        if (!adbClient) {
            throw new Error('ADB client not initialized');
        }
        
        const deviceList = await adbClient.listDevices();
        return deviceList.reduce((map, device) => {
            if (device?.id) {
                map[device.id] = { status: 0 };
            }
            return map;
        }, {} as DevicesMap);
    }
    catch (err: unknown) {
        handleError('Failed to get devices', err);
        return {} as DevicesMap;
    }
}

/**
 * 检查设备是否可用
 */
export async function checkConnect(deviceId: string) {
    let deviceMap = await devices();
    if (!deviceMap[deviceId]) {
        throw new Error('未连接该设备');
    }
};

/**
 * 检查设备是否开启 USB 调试模式
 */
export async function checkDeviceSet(deviceId: string){
    try {
        await shell(deviceId, '[ -r /dev/input/event0 ]');
    } catch (err) {
        throw new Error('设备未开启 `USB 调试（安全设置）`');
    }
};

/**
 * 检查应用是否安装
 */
export async function isInstalled(deviceId: string, packageName: string): Promise<boolean> {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    const res = await adbClient.isInstalled(deviceId, packageName) as boolean;
    return res;
}

/**
 * 检查文件是否存在
 */
export async function fileExist(deviceId: string, path: string): Promise<boolean> {
    try {
        const res = await shell(deviceId, `ls ${path}`);
        return res === path;
    } catch (err) {
        logger.error(`[adb.fileExist] Error checking file existence: ${err}`);
        return false;
    }
}

/**
 * Forwards socket connections from the ADB server host (local) to the device (remote).
 */
export async function forward(deviceId: string, local: string, remote: string): Promise<void> {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    await adbClient.forward(deviceId, local, remote);
}

/**
 * 获取本机 IP
 */
export async function ip(deviceId: string) {
    if (!ipMap[deviceId]) {
        let ifconfig = await shell(deviceId, 'ifconfig | grep Bcast');
        try {
            ipMap[deviceId] = ifconfig.split('addr:')[1].split('  Bcast')[0];
        } catch (err: unknown) {
            const error = err as Error;
            throw new Error(`[adb.ip] ${error.stack}`);
        }
    }
    return ipMap[deviceId];
}

/**
 * 返回主页
 */
export async function home(deviceId: string) {
    return await shell(deviceId, 'input keyevent 3');
}

/**
 * 启动 Activity
 */
export async function startActivity(deviceId: string, options: any) {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    let res = await adbClient.startActivity(deviceId, options);
    return res;
}

/**
 * 安装应用
 */
export async function install(deviceId: string, appPath: string) {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    await adbClient.install(deviceId, appPath);
}

/**
 * 卸载应用
 */
export async function uninstall(deviceId: string, appId: string) {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    await adbClient.uninstall(deviceId, appId);
}

/**
 * 检查进程是否存在
 */
export async function isAppProcessExist(deviceId: string, processName: string): Promise<boolean> {
    const psCommands = ['ps', 'ps -ef'];

    for (const cmd of psCommands) {
        try {
            const command = `${cmd} | grep -v 'grep' | grep '${processName}'`;
            const res = await shell(deviceId, command);
            if (res) {
                return true;
            }
        } catch (err) {
            logger.error(`Error checking process with command "${cmd}": ${(err as Error).message}`);
        }
    }

    return false;
}

/**
 * 终止 APP 进程
 */
export async function killAppProcess(deviceId: string, processName: string): Promise<void> {
    await shell(deviceId, `am force-stop ${processName}`)
};

/**
 * 拉取文件
 */
export async function pull(deviceId: string, path: string): Promise<Buffer> {
    const adbClient = getAdb();
    if (!adbClient) {
        throw new Error('ADB client not initialized');
    }
    return new Promise<Buffer>((resolve, reject) => adbClient
        .pull(deviceId, path)
        .then((transfer: { on: (event: string, listener: (buffer: Buffer) => void) => void; }) => {
            const bufferList: Buffer[] = [];
            transfer.on('data', (buffer: Buffer) => bufferList.push(buffer));
            transfer.on('error', reject);
            transfer.on('end', () => resolve(Buffer.concat(bufferList)));
        })
        .catch((err: any) => reject(err))
    );
};

/**
 * 截图
 */
export async function screenshot(deviceId: string): Promise<Buffer> {
    let deviceScreenshotPath = '/sdcard/screenshot.png';
    await shell(deviceId, `screencap -p ${deviceScreenshotPath}`);
    return await pull(deviceId, deviceScreenshotPath);
};

/**
 * 获取设备屏幕尺寸
 */
export async function getScreenSize(deviceId: string): Promise<ScreenSize> {
    if (screenSizeMap[deviceId]) {
        return screenSizeMap[deviceId];
    }
    else {
        let res = await shell(deviceId, 'dumpsys window displays | head -n 10');
        try {
            let parts = res.split(' rng=')[0].split(' ');
            // app=1080x2264: app 占用宽高 
            let displayInfo = parts[parts.length - 1].split('=')[1].split('x');
            let displayWidth = parseInt(displayInfo[0], 10);
            let displayHeight = parseInt(displayInfo[1], 10);

            // cur=1080x2340: 屏幕物理宽高
            let screenInfo = parts[parts.length - 2].split('=')[1].split('x');
            let width = parseInt(screenInfo[0], 10);
            let height = parseInt(screenInfo[1], 10);

            let statusBarHeight = height - displayHeight;
            screenSizeMap[deviceId] = { width, height, displayWidth, displayHeight, statusBarHeight };
            return screenSizeMap[deviceId];
        } catch (err) {
            throw new Error(`Get device screen size failed: ${err}`);
        }
    }
};

/**
 * 获取默认输入法
 */
export async function getDefaultKeyboard(deviceId: string): Promise<string> {
    let cmd = 'settings get secure default_input_method';
    return await shell(deviceId, cmd);
};

/**
 * 切换输入法
 */
export async function changeKeyboard(
    deviceId: string,
    keyboard: string = 'com.android.adbkeyboard/.AdbIME'
): Promise<string> {
    const cmd = `settings put secure default_input_method ${keyboard}`;
    
    try {
        const res = await shell(deviceId, cmd);
        if (res.includes('Security')) {
            const errorMessage = '由于权限受限，切换输入法到 adbkeyboard 失败';
            logger.error(`[adb.changeKeyboard] ${errorMessage}`);
            throw new Error(errorMessage);
        }
        return res;
    } catch (error) {
        logger.error(`[adb.changeKeyboard] 执行命令失败: ${error instanceof Error ? error.message : String(error)}`);
        throw new Error('切换输入法时发生错误');
    }
}

/**
 * 回车
 */
export async function enter(deviceId: string): Promise<boolean> {
    let res = await shell(deviceId, 'input keyevent 66');
    if (res) {
        logger.error(`[adb.enter] 执行命令: input keyevent 66 失败: ${res}`);
        return false;
    }
    logger.info(`[adb.enter] 执行命令: input keyevent 66 成功`);
    return true;
}

/**
 * 返回
 */
export async function back(deviceId: string): Promise<boolean> {
    let res = await shell(deviceId, 'input keyevent 4');
    if (res) {
        logger.error(`[adb.back] 执行命令: input keyevent 4 失败: ${res}`);
        return false;
    }
    logger.info(`[adb.back] 执行命令: input keyevent 4 成功`);
    return true;
}