/**
 * @desc: 设备操控类
 * @author: john_chen
 * @date: 2023.03.14
 */
import { writeFileSync } from 'fs';
import { xml2json } from 'xml-js';

import { logger } from './config';
import { delay } from './utils/time';

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
        logger.info('[device.goto]');
        return await this.handler.goto(path);
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
     * @returns {Promise{Array{DeviceElement}}}
     */
    async $x(
        expression: string,
        options = {
            loop: 3,
            duration: 1000,
            retry: 3,
        }
    ): Promise<Element> {
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
     * @param {number} quality  图片质量
     * @returns {Promise{Buffer|String}}
     */
    async screenshot(options = { path: '', quality: 1 }): Promise<Buffer | string> {
        logger.info('[device.screenshot]');
        return await this.handler.screenshot(options);
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
    async tap(x: number, y: number) {
        let res = await this.handler.tap(x, y);
        logger.info(`[device.tap] ${x}, ${y}`);
        return res;
    }

    /**
     * 屏幕滑动
     *
     * @param {number} fx 起点横坐标
     * @param {number} fy 起点纵坐标
     * @param {number} tx 终点横坐标
     * @param {number} ty 终点纵坐标
     * @param {Object} options
     * @param {number} options.duration           滑动时长（适用 android）
     * @param {number} options.startPressDuration 起步按压时长（适用 iOS）
     * @return {Promise}
     */
    async swipe(
        fx: number,
        fy: number,
        tx: number,
        ty: number,
        options = {
            duration: 300,
            startPressDuration: 0,
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
        let res = this.handler.version();
        logger.info(`[device.version] ${res}`);
        return res;
    }

    /**
     * 关闭设备操控实例
     */
    async close(): Promise<void> {
        logger.info('[device.close]');
        await this.handler.close();
    }
}
