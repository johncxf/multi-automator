
/**
 * @desc: iOS Device Operation
 * @author: john_chen
 * @date: 2025.01.12
 */
import { spawnSync } from 'child_process';
import { AppInfo, DevicesMap } from '../types';

export async function devices(): Promise<DevicesMap> {
    let { stdout, stderr, status } = spawnSync('idevice_id -l', {
        shell: true,
        timeout: 20000,
    });

    if (0 !== status) {
        throw new Error(
            `未正确安装 idevice_id: ${stderr.toString()}，请执行命令 'brew install libimobiledevice' 进行安装`
        );
    }

    let deviceConnectMap: DevicesMap = {};
    for (let udid of stdout.toString().split('\n')) {
        const trimUdid = udid.trim();
        if (trimUdid) {
            deviceConnectMap[trimUdid] = {
                status: 0
            };
        }
    }
    return deviceConnectMap;
}

export async function installApp(udid: string, appPath: string): Promise<void> {
    let { stderr, status } = spawnSync(`ideviceinstaller --install ${appPath} -u ${udid}`, {
        shell: true,
        timeout: 20000,
    });

    if (0 !== status) {
        throw new Error(
            `未正确安装 ideviceinstaller: ${stderr.toString()}，请执行命令 'brew install ideviceinstaller' 进行安装`
        );
    }
}

export async function uninstallApp(udid: string, packageName: string): Promise<void> {
    let { stderr, status } = spawnSync(`ideviceinstaller --uninstall ${packageName} -u ${udid}`, {
        shell: true,
        timeout: 20000,
    });

    if (0 !== status) {
        throw new Error(
            `未正确安装 ideviceinstaller: ${stderr.toString()}，请执行命令 'brew install ideviceinstaller' 进行安装`
        );
    }
}

export async function getAppList(udid: string): Promise<AppInfo[]> {
    try {
        const { stdout, stderr, status } = spawnSync(`ideviceinstaller --list-apps -u ${udid}`, {
            shell: true,
            timeout: 20000,
            encoding: 'utf8'
        });

        if (status !== 0) {
            throw new Error(
                `未正确安装 ideviceinstaller: ${stderr}，请执行命令 'brew install ideviceinstaller' 进行安装`
            );
        }

        return stdout
            .split('\n')
            .filter(line => line.trim())
            .slice(1)
            .map(line => {
                const [appId = '', version = '', name = ''] = line.split(',').map(item => item.trim());
                return { appId, version, name };
            });
            
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`获取应用列表失败: ${error.message}`);
        }
        throw new Error('获取应用列表失败');
    }
}