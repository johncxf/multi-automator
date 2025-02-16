/**
 * @desc: 设备操控类
 * @author: john_chen
 * @date: 2023.03.14
 */
import { writeFileSync } from 'fs';
import { xml2json } from 'xml-js';

import { logger } from './config';
import { delay } from './utils/time';

import WebElement from './web/Element';
import IOSElement from './iOS/Element';

import { AppInfo, SwipeOptions } from './types';

/**
 * Device Options
 */
export interface DeviceOptions {
    deviceId?: string;
    deviceType: string;
}

/**
 * 设备操控类
 */
export default class Device {
    /**
     * 设备ID
     */
    id: string;

    /**
     * 设备类型
     */
    type: string;

    /**
     * 设备对象
     */
    handler: any;

    /**
     * 构造函数
     *
     * @param {string} deviceId       设备 ID
     * @param {string} deviceType     设备类型
     */
    constructor(options: DeviceOptions) {
        const { deviceId, deviceType } = options;
        this.id = deviceId || 'web-device-id';
        this.type = deviceType;
        this.handler = null;
    }

    /**
     * 初始化函数
     *
     * @param {Promise{any}} handler 设备处理对象
     */
    async init(handler: any): Promise<void> {
        this.handler = handler;
    }

    /**
     * 跳转页面
     *
     * @param {string} path url 地址
     * @returns {string}
     */
    async goto(path: string): Promise<string> {
        if (this.handler.goto) {
            logger.info(`[device.goto] ${path}`);
            return await this.handler.goto(path);
        }
        throw new Error('goto method not implemented');
    }

    /**
     * home 键
     */
    async home(): Promise<void> {
        if (this.handler.home) {
            logger.info('[device.home]');
            await this.handler.home();
        }
    }

    /**
     * 获取当前设备页面 dom 树
     *
     * @param {string} path     存储路径
     * @param {string} format   返回格式
     * @param {number} timeout  操作超时时间（ms）
     * @return {Promise{string}}
     */
    async source(
        options = {
            timeout: 30000,
            format: 'string',
            path: '',
        }
    ): Promise<string> {
        logger.info('[device.source]');
        const { timeout = 30000, format = 'string', path = '' } = options;
        try {
            let res = await this.handler.source(timeout);
            if (path) {
                writeFileSync(path, res);
            }
            if ('json' === format) {
                res = xml2json(res, { compact: false });
                return res;
            } else if ('object' === format) {
                res = JSON.parse(xml2json(res, { compact: false }));
                return res;
            } else {
                return res;
            }
        } catch (err: any) {
            logger.error(`[device.source] ${err.stack}`);
            throw err;
        }
    }

    /**
     * 通过 xpath 获取设备元素
     *
     * @param {string} expression XPath表达式
     * @param {object} options
     * @param {number} options.loop 轮询次数，默认 3
     * @param {number} options.duration 轮询时间间隔（ms），默认 1000
     * @param {number} options.retry 查询异常重试次数，默认 3
     * @returns {Promise{Array{WebElement}}}
     */
    async $x(
        expression: string,
        options = {
            loop: 3,
            duration: 1000,
            retry: 3,
        }
    ): Promise<WebElement[]|IOSElement[]> {
        logger.info('[device.$x]');
        let { loop = 6, duration = 1000, retry = 3 } = options;
        let retryCount = 0;
        let elements = [];
        for (let count = -1; count < loop; count++) {
            try {
                elements = await this.handler.$x(expression);
            } catch (err: any) {
                retryCount++;
                if (retryCount > retry) {
                    throw new Error(`find elements error: ${err.message}`);
                }
            }

            if (elements.length > 0) {
                break;
            }
            await delay(duration);
        }
        return elements;
    }

    /**
     * 通过 CSS 选择器获取元素操作对象 - 仅支持 web 设备
     *
     * @param selector CSS 选择器
     * @param {object} options
     * @param {number} options.loop 轮询次数，默认 3
     * @param {number} options.duration 轮询时间间隔（ms），默认 1000
     * @param {number} options.retry 查询异常重试次数，默认 3
     * @returns @returns {Promise{WebElement|null}}}
     */
    async $(
        selector: string,
        options = {
            loop: 3,
            duration: 1000,
            retry: 3,
        }
    ): Promise<WebElement|null> {
        if (this.type !== 'web') {
            throw new Error('not support');
        }
        logger.info('[device.$]');
        let { loop = 6, duration = 1000, retry = 3 } = options;
        let retryCount = 0;
        let element = null;
        for (let count = -1; count < loop; count++) {
            try {
                element = await this.handler.$(selector);
            } catch (err: any) {
                retryCount++;
                if (retryCount > retry) {
                    throw new Error(`寻找元素异常：${err.message}`);
                }
            }

            if (null !== element) {
                break;
            }
            await delay(duration);
        }
        return element;
    }

    /**
     * 通过 CSS 选择器获取元素操作对象列表 - 仅支持 web 设备
     *
     * @param selector CSS 选择器
     * @param {object} options
     * @param {number} options.loop 轮询次数，默认 3
     * @param {number} options.duration 轮询时间间隔（ms），默认 1000
     * @param {number} options.retry 查询异常重试次数，默认 3
     * @returns @returns {Promise{Array{WebElement}}}
     */
    async $$(
        selector: string,
        options = {
            loop: 3,
            duration: 1000,
            retry: 3,
        }
    ): Promise<WebElement[]> {
        if (this.type !== 'web') {
            throw new Error('not support');
        }
        logger.info('[device.$$]');
        let { loop = 6, duration = 1000, retry = 3 } = options;
        let retryCount = 0;
        let elements = [];
        for (let count = -1; count < loop; count++) {
            try {
                elements = await this.handler.$$(selector);
            } catch (err: any) {
                retryCount++;
                if (retryCount > retry) {
                    throw new Error(`寻找元素异常：${err.message}`);
                }
            }

            if (elements.length > 0) {
                break;
            }
            await delay(duration);
        }
        return elements;
    }

    /**
     * 设备截图
     *
     * @param {string} path     图片路径
     * @returns {Promise{Buffer|String}}
     */
    async screenshot(options: { path?: string } = {}): Promise<Buffer | string> {
        if (this.handler.screenshot) {
            logger.info('[device.screenshot]');
            const { path = '' } = options;
            return await this.handler.screenshot(path);
        }
        throw new Error('screenshot method not implemented');
    }

    /**
     * 获取设备屏幕宽高
     *
     * @return {object} screenInfo
     * @return {number} screenInfo.width 真实宽
     * @return {number} screenInfo.height 真实高
     */
    async getScreenSize(): Promise<object> {
        logger.info('[device.getScreenSize]');
        try {
            let res = await this.handler.getScreenSize();
            return res;
        } catch (err: any) {
            logger.error(`[device.getScreenSize] ${err.stack}`);
            throw err;
        }
    }

    /**
     * 屏幕点击
     *
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @return {Promise}
     */
    async tap(x: number, y: number): Promise<void> {
        if (!this.handler.tap) {
            throw new Error('tap method not implemented');
        }
        await this.handler.tap(x, y);
        logger.info(`[device.tap] ${x}, ${y}`);
    }

    /**
     * 长按屏幕
     * 
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @param {number} duration 长按时间(ms)
     */
    async longpress(x: number, y: number, duration: number = 3000): Promise<void> {
        if (!this.handler.longpress) {
            throw new Error('longpress method not implemented');
        }
        await this.handler.longpress(x, y, duration);
        logger.info(`[device.longpress] ${x}, ${y}, ${duration}`);
    }

    /**
     * 屏幕滑动
     *
     * @param {number} fx 起点横坐标
     * @param {number} fy 起点纵坐标
     * @param {number} tx 终点横坐标
     * @param {number} ty 终点纵坐标
     * @param {Object} options
     * @return {Promise}
     */
    async swipe(
        fx: number,
        fy: number,
        tx: number,
        ty: number,
        options: SwipeOptions = {
            duration: 300,
            startPressDuration: 0
        }   
    ) {
        let res = await this.handler.swipe(fx, fy, tx, ty, options);
        logger.info(`[device.swipe] ${fx}, ${fy}, ${tx}, ${ty}`);
        return res;
    }

    /**
     * 获取版本信息
     *
     * @returns {Promise}
     */
    async version(): Promise<string> {
        if (this.handler.version) {
            let res = await this.handler.version();
            logger.info(`[device.version] ${res}`);
            return res;
        }
        throw new Error('version method not implemented');
        
    }

    /**
     * 获取应用列表
     *
     * @returns {Promise{Array{AppInfo}}}
     */ 
    async appList(): Promise<AppInfo[]> {
        if (this.handler.appList) {
            return await this.handler.appList();
        }
        throw new Error('appList method not implemented');
    }

    /**
     * 判断应用是否已安装
     *
     * @param {string} appId 应用ID
     * @returns {Promise{boolean}}
     */
    async isInstalled(packageName: string): Promise<boolean> {
        const appList = await this.appList();
        return appList.some(app => app.appId === packageName);
    }

    /**
     * 安装应用
     *
     * @param {string} appPath 应用路径
     * @returns {Promise}
     */
    async install(appPath: string): Promise<void> {
        if (this.handler.install) {
            logger.info(`[device.install] ${appPath}`);
            return await this.handler.install(appPath);
        }
        throw new Error('install method not implemented');
    }

    /**
     * 卸载应用
     *
     * @param {string} appId 应用ID
     * @returns {Promise}
     */
    async uninstall(appId: string): Promise<void> {
        if (this.handler.uninstall) {
            logger.info(`[device.uninstall] ${appId}`);
            return await this.handler.uninstall(appId);
        }
        throw new Error('uninstall method not implemented');
    }

    /**
     * 启动 APP
     *
     * @param packageName 包名
     * @returns {Promise}
     */ 
    async launchApp(packageName: string): Promise<void> {
        if (this.handler.launchApp) {
            logger.info(`[device.launchApp] ${packageName}`);
            return await this.handler.launchApp(packageName);
        }
        throw new Error('launchApp method not implemented');
    }

    /**
     * 终止 APP
     * 
     * @param packageName 包名
     */
    async terminateApp(packageName: string): Promise<void> {
        if (this.handler.terminateApp) {
            logger.info(`[device.terminateApp] ${packageName}`);
            return await this.handler.terminateApp(packageName);
        }
        throw new Error('terminateApp method not implemented');
    }

    /**
     * 激活 APP
     * 
     * @param packageName 包名
     */
    async activateApp(packageName: string): Promise<void> {
        if (this.handler.activateApp) {
            logger.info(`[device.activateApp] ${packageName}`);
            return await this.handler.activateApp(packageName);
        }
        throw new Error('activateApp method not implemented');
    }

    /**
     * 关闭设备操控实例
     */
    async close(): Promise<void> {
        if (this.handler.close) {
            logger.info('[device.close]');
            await this.handler.close();
        }
    }
}
