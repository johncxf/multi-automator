/**
 * @desc: iOS Handler
 * @author: john_chen
 * @date: 2024.12.30
 */
import { writeFileSync } from 'fs';
import WDA from './WDA';
import { AppInfo, SwipeOptions } from '../types';
import { logger } from '../config';
import { getAppList, installApp, uninstallApp } from './idevice';
import Element from './Element';

export default class IOSHandler {
    /**
     * 设备 UDID
     */
    udid: string;

    /**
     * WebDriverAgent 项目路径
     */
    wdaProjPath: string;

    /**
     * WebDriverAgent 实例
     */
    wda: WDA | null;

    constructor(udid: string, wdaProjPath: string) {
        this.udid = udid;
        this.wdaProjPath = wdaProjPath;
        this.wda = null;
    }

    /**
     * init iOS handler
     */
    async init(): Promise<void> {
        logger.info('[iOS.Handler.init]');
        this.wda = new WDA(this.udid, this.wdaProjPath);
        await this.wda.init();
    }

    /**
     * 关闭 iOS handler
     */
    async close(): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        await this.wda.stop();
    }

    /**
     * home
     */
    async home(): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        await this.wda.home();
    }

    /**
     * 获取应用列表
     */
    async appList(): Promise<AppInfo[]> {
        return await getAppList(this.udid);
    }

    /**
     * 安装应用
     */
    async installApp(appPath: string): Promise<void> {
        return await installApp(this.udid, appPath);
    }

    /**
     * 卸载应用
     */
    async uninstallApp(appId: string): Promise<void> {
        return await uninstallApp(this.udid, appId);
    }

    /**
     * 启动 APP
     */
    async launchApp(packageName: string): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.launchApp(packageName);
    }

    /**
     * 终止 APP
     */
    async terminateApp(packageName: string): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.terminateApp(packageName);
    }

    /**
     * 激活 APP
     */ 
    async activateApp(packageName: string): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.activateApp(packageName);
    }

    /**
     * 获取 dom 树
     */
    async source(timeout: number = 20000): Promise<any> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.getSource(timeout);
    }

    /**
     * 获取当前设备页面截图
     */
    async screenshot(path: string): Promise<Buffer> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        const res = await this.wda.screenshot();
        if (path) {
            writeFileSync(path, res);
        }
        return res;
    }

    /**
     * 屏幕点击
     */ 
    async tap(x: number, y: number): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.tap(x, y);
    }

    /**
     * 长按屏幕
     */ 
    async longpress(x: number, y: number, duration: number): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.longpress(x, y, duration / 1000);
    }

    /**
     * 滑动屏幕
     */
    async swipe(fx: number, fy: number, tx: number, ty: number, options: SwipeOptions) {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        const { startPressDuration } = options;
        
        // 获取屏幕宽高
        const screenSize = await this.getScreenSize() as { width: number; height: number };
        const { width, height } = screenSize;

        // 处理坐标
        if (fx < 0) {
            fx = 0;
        }
        if (fx > width) {
            fx = width;
        }

        if (fy < 0) {
            fy = 0;
        }
        if (fy > height) {
            fy = height;
        }

        if (tx < 0) {
            tx = 0;
        }
        if (tx > width) {
            tx = width;
        }

        if (ty < 0) {
            ty = 0;
        }
        if (ty > height) {
            ty = height;
        }
        return await this.wda.drag(
            fx,
            fy,
            tx,
            ty,
            (startPressDuration || 1) / 1000
        );
    }

    /**
     * 获取屏幕宽高
     */ 
    async getScreenSize(): Promise<object> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.getScreenSize();
    }

    /**
     * 获取当前设备屏幕信息
     */ 
    async getScreenInfo(): Promise<object> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.getScreenInfo();
    }

    /**
     * 跳转页面
     */
    async goto(url: string): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.openUrl(url);
    }

    /**
     * 重新激活当前活动的应用（先home桌面，再打开该应用）
     */
    async deactivateApp(): Promise<void> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        return this.wda.deactivateApp();
    }

    /**
     * 获取元素对象
     */
    async $x(expression: string): Promise<Element[]> {
        if (!this.wda) {
            throw new Error('WDA not initialized');
        }
        const res = await this.wda.findElements('xpath', expression);
        let elements = [];
        for (let element of res) {
            elements.push(new Element({
                device: this,
                element,
            }));
        }
        return elements;
    }
}
