/**
 * @desc: android Handler
 * @author: john_chen
 * @date: 2025.03.02
 */
import { writeFileSync } from 'fs';
import { DOMParser } from 'xmldom';
import * as xpath from 'xpath';

import * as adb from './adb';
import Atx from './Atx';
import { checkEnv } from './env';
import { logger } from '../config';
import { AppInfo, ScreenSize } from '../types';
import Element from './Element';


export default class AndroidHandler {
    /**
     * 设备ID
     */
    id: string;

    /**
     * 连接类型：USB、WIFI
     */
    connectType: string;

    /**
     * ATX 实例
     */
    atx: Atx | null;

    /**
     * adb 实例
     */
    adb: typeof adb;

    constructor(deviceId: string, connectType: 'usb' | 'wifi') {
        this.id = deviceId;
        this.connectType = connectType;
        this.atx = null;
        this.adb = adb;
    }

    /**
     * 初始化
     */
    async init() {
        logger.info('[android.Handler.init]');
        await checkEnv(this.id);
        this.atx = new Atx({ deviceId: this.id, connectType: this.connectType as 'usb' | 'wifi' });
        await this.atx.init();
    }

    /**
     * 关闭
     */
    async close(): Promise<void> {
        if (this.atx) {
            await this.atx.close();
        }
    }

    /**
     * 返回主页
     */
    async home(): Promise<void> {
        await this.adb.home(this.id);
    }

    /**
     * 打开网页
     */
    async goto(url: string): Promise<void> {
        await this.adb.startActivity(this.id, {
            data: url
        });
    }

    /**
     * 安装 APP
     */
    async installApp(appPath: string): Promise<void> {
        return await this.adb.install(this.id, appPath);
    }

    /**
     * 卸载 APP
     */
    async uninstallApp(appId: string): Promise<void> {
        return await this.adb.uninstall(this.id, appId);
    }

    /**
     * 检查 APP 是否安装
     */
    async isInstalled(packageName: string): Promise<boolean> {
        return await this.adb.isInstalled(this.id, packageName);
    }

    /**
     * 启动 APP
     */
    async launchApp(packageName: string, activity: string) {
        let isAppInstalled = await this.adb.isInstalled(this.id, packageName);
        if (!isAppInstalled) {
            throw new Error(`APP is not installed: ${packageName}`);
        }
        if (!activity) {
            if (!this.atx) {
                throw new Error('ATX not initialized');
            }
            const info = await this.atx.packageInfo(packageName);
            if (!info) {
                throw new Error(`can not get app info: ${packageName}`);
            }
            activity = info.activity || '';
            if (!activity) {
                throw new Error(`can not get launch activity: ${packageName}`); 
            }
        }

        await this.adb.startActivity(this.id, {
            wait: true,
            action: 'android.intent.action.MAIN',
            category: 'android.intent.category.LAUNCHER',
            component: `${packageName}/${activity}`
        });
        logger.info(`[android.Handler.launchApp] ${packageName}/${activity}`);
    }

    async terminateApp(packageName: string): Promise<void> {
        let isAppInstalled = await this.adb.isInstalled(this.id, packageName);
        if (!isAppInstalled) {
           throw new Error(`APP is not installed: ${packageName}`);
        }
        let res = await this.adb.isAppProcessExist(this.id, packageName);
        if (res) {
            await this.adb.killAppProcess(this.id, packageName);
        }
        logger.info(`[android.Handler.terminateApp] ${packageName}`);
    }

    /**
     * 获取 APP 列表
     */
    async appList(): Promise<AppInfo[]> {
        if (!this.atx) {
            throw new Error('ATX not initialized');
        }
        return await this.atx.packages();
    }

    /**
     * 获取 APP 信息
     */
    async appInfo(packageName: string): Promise<AppInfo> {
        if (!this.atx) {
            throw new Error('ATX not initialized');
        }
        return await this.atx.packageInfo(packageName);
    }

    /**
     * 获取设备信息
     */
    async info(): Promise<any> {
        if (!this.atx) {
            throw new Error('ATX not initialized');
        }
        return await this.atx.info();
    }

    /**
     * 获取当前设备页面 dom 树
     */
    async source(timeout: number = 20000): Promise<string> {
        if (!this.atx) {
            throw new Error('ATX not initialized');
        }
        return await this.atx.source(timeout);
    }

    /**
     * 截图
     */
    async screenshot(path?: string): Promise<Buffer> {
        const res = await this.adb.screenshot(this.id);
        if (path) {
            writeFileSync(path, res);
        }
        return res;
    }

    /**
     * 获取屏幕尺寸
     */
    async getScreenSize(): Promise<ScreenSize> {
        return await this.adb.getScreenSize(this.id);
    }

    /**
     * 点击操作
     */
    async tap(x: number, y: number): Promise<boolean> {
        let res = await this.adb.shell(this.id, `input tap ${x} ${y}`);
        if (res.includes('Exception')) {
            logger.error(`[android.Handler.tap] ${res}`);
            return false;
        }
        logger.info(`[android.Handler.tap] ${x}, ${y}`);
        return true;
    }

    /**
     * 滑动操作
     */
    async swipe(
        fx: number, fy: number, tx: number, ty: number, { duration }: { duration: number } = { duration: 300 }
    ) {
        let cmd = `input swipe ${fx} ${fy} ${tx} ${ty} ${duration}`;
        let res = await this.adb.shell(this.id, cmd);
        logger.info(`[android.Handler.swipe] ${fx}, ${fy}, ${tx}, ${ty}, ${duration}`);
        return res;
    }

    /**
     * 长按操作
     */
    async longpress(x: number, y: number, duration: number = 3000) {
        let res = await this.swipe(x, y, x, y, { duration });
        logger.info(`[android.Handler.longpress] ${x}, ${y}, ${duration}`);
        return res;
    }

    /**
     * 输入文本
     */
    async input(text: string) {
        const escapedText = text.replace(/([\\'\"` ])/g, '\\$1');
        const cmd = `am broadcast -a ADB_INPUT_TEXT --es msg "${escapedText}"`;
        let res = await this.adb.shell(this.id, cmd);
        logger.info(`[android.Handler.input] ${res}`);
        return res;
    }

    async $x(expression: string): Promise<Element[]> {
        const xml = await this.source();
        const doc = new DOMParser().parseFromString(xml, 'text/xml');
        const nodes = xpath.select(expression, doc) as Array<any>;
        const screenSize = await this.getScreenSize();
        const { height, statusBarHeight = 0 } = screenSize;

        const elements: Element[] = nodes.map(node => {
            const boundsAttr = node.attributes.getNamedItem('bounds');
            if (!boundsAttr || !boundsAttr.nodeValue) {
                throw new Error('Bounds attribute is missing or invalid');
            }

            const bounds = this.parseBounds(boundsAttr.nodeValue);
            if (bounds[3] === height - statusBarHeight) {
                bounds[3] = height;
            }

            return new Element({
                device: this,
                bounds: {
                    x: bounds[0],
                    y: bounds[1],
                    width: bounds[2] - bounds[0],
                    height: bounds[3] - bounds[1]
                },
                attributes: node.attributes
            });
        });

        return elements;
    }

    /**
     * 回车
     */
    async enter(): Promise<boolean> {
        return await this.adb.enter(this.id);
    }

    /**
     * 返回
     */
    async back(): Promise<boolean> {
        return await this.adb.back(this.id);
    }

    private parseBounds(boundsString: string): number[] {
        const arrSplit = boundsString.slice(1, -1).split('][');
        const bounds = arrSplit[0].split(',').concat(arrSplit[1].split(','));
        return bounds.map(item => parseInt(item, 10));
    }
}
