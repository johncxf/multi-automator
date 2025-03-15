/**
 * @desc: env
 * @author: john_chen
 * @date: 2025.03.05
 */
import { logger } from '../config';
import * as adb from './adb';

interface DependAppInfo {
    packageName: string;
    apkName: string;
}

const DEVICE_TMP_DIR = '/data/local/tmp';
const REQUIRED_JARS = ['bundle.jar', 'uiautomator-stub.jar'];
const REQUIRED_BINS = ['atx-agent'];
// const REQUIRED_BINS = ['atx-agent', 'minicap', 'minitouch'];

const dependAppMap: Record<string, DependAppInfo> = {
    uiautomator: {
        packageName: 'com.github.uiautomator',
        apkName: 'app-uiautomator.apk'
    },
    uiautomatorTest: {
        packageName: 'com.github.uiautomator.test',
        apkName: 'app-uiautomator-test.apk'
    },
    adbkeyboard: {
        packageName: 'com.android.adbkeyboard',
        apkName: 'ADBKeyboard.apk'
    }
};


/**
 * 检查环境
 */
export async function checkEnv(deviceId: string): Promise<void> {
    logger.info('[android.env.checkEnv]');
    try {
        // 串行检查设备连接状态
        await adb.checkConnect(deviceId);
        await adb.checkDeviceSet(deviceId);

        // 并行检查依赖项
        await Promise.all([
            checkApp(deviceId).catch(err => { throw new Error(`App check failed: ${err.message}`) }),
            checkJar(deviceId).catch(err => { throw new Error(`Jar check failed: ${err.message}`) }),
            checkBin(deviceId).catch(err => { throw new Error(`Bin check failed: ${err.message}`) })
        ]);
    } catch (err: unknown) {
        throw new Error(`Environment check failed: ${(err as Error).message}`);
    }
}

async function checkApp(deviceId: string): Promise<void> {
    logger.info('[android.env.checkApp]');
    await Promise.all(
        Object.values(dependAppMap).map(async ({ packageName }) => {
            if (!await adb.isInstalled(deviceId, packageName)) {
                throw new Error(`[android.checkDependApp] app ${packageName} is not installed`);
            }
        })
    );
}

async function checkJar(deviceId: string): Promise<void> {
    logger.info('[android.env.checkJar]');
    await Promise.all(
        REQUIRED_JARS.map(async (jarName) => {
            const jarPath = `${DEVICE_TMP_DIR}/${jarName}`;
            if (!await adb.fileExist(deviceId, jarPath)) {
                throw new Error(`atx 依赖文件 ${jarName} 不存在`);
            }
        })
    );
}

async function checkBin(deviceId: string): Promise<void> {
    logger.info('[android.env.checkBin]');
    await Promise.all(
        REQUIRED_BINS.map(async (binName) => {
            const binPath = `${DEVICE_TMP_DIR}/${binName}`;
            if (!await adb.fileExist(deviceId, binPath)) {
                throw new Error(`${binName} 不存在`);
            }
        })
    );
}

export { DEVICE_TMP_DIR };
