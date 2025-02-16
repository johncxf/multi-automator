/**
 * @desc: Web Handler
 * @author: john_chen
 * @date: 2023.03.13
 */
import { writeFileSync } from 'fs';
import puppeteer, { KnownDevices, Viewport } from 'puppeteer-core';

import ElementHandle from './Element';
import { logger } from '../config';

export interface LaunchOptions {
    headless?: boolean;
    devtools?: boolean;
    defaultViewport?: null | Viewport;
    args?: string[];
    ignoreDefaultArgs?: boolean | string[];
};

/**
 * web 操控类
 */
export default class WebHandler {
    /**
     * 初始化参数
     */
    launchOptions: object;

    /**
     * 是否开启设备模拟
     */
    emulate: boolean;

    /**
     * 设备
     */
    model: string;

    /**
     * 浏览器路径
     */
    browserPath: string;

    /**
     * browser 实例
     */
    browser: any;

    /**
     * page 实例
     */
    page: any;

    /**
     * 屏幕尺寸
     */
    screenSize: object | null;

    /**
     * Web Operator
     *
     * @param {string} browserPath 浏览器地址，默认使用 chromium 地址
     */
    constructor(browserPath: string) {
        this.emulate = false;
        this.model = 'Galaxy S5';
        this.browserPath = browserPath;
        this.launchOptions = {};
        this.browser = null;
        this.page = null;
        this.screenSize = null;
    }

    /**
     * init 参数处理
     *
     * @param launchOptions LaunchOptions
     */
    checkInitOptions(launchOptions?: LaunchOptions): void {
        launchOptions = launchOptions || {};
        const {
            headless = true,
            devtools = false,
            defaultViewport = null,
            args = ['--start-fullscreen'],
            ignoreDefaultArgs = ['--enable-automation', '--enable-blink-features=IdleDetection']
        } = launchOptions;
        this.launchOptions = {
            executablePath: this.browserPath,
            headless,
            devtools,
            defaultViewport,
            args,
            ignoreDefaultArgs
        };
    }

    /**
     * init Web operator
     *
     * @param {boolean} headless 是否采用无头方案
     * @param {boolean} devtools 是否启用调试工具
     * @param {array{object}} cookies 需要设置的 cookies
     * @param {string} emulate 是否开启设备模拟
     * @param {object} headers headers
     */
    async init(
        launchOptions?: LaunchOptions,
        cookies?: object[],
        emulate: boolean = false,
        headers?: object
    ): Promise<void> {
        logger.info('[web.init]');
        await this.close();

        // 初始化浏览器实例
        this.checkInitOptions(launchOptions);
        this.browser = await puppeteer.launch(this.launchOptions);

        // 初始化页面实例
        let pages = await this.browser.pages();
        this.page = pages[0];

        // 选定设备型号
        if (emulate) {
            this.emulate = true;
            // @ts-ignore
            await this.page.emulate(KnownDevices[this.model]);
        }

        // 设置 cookie
        if (undefined !== cookies && cookies.length > 0) {
            for (let cookie of cookies) {
                await this.page.setCookie(cookie);
            }
        }

        // 设置 header
        if (undefined !== headers) {
            await this.page.setExtraHTTPHeaders(headers);
        }
    }

    /**
     * 通过 xpath 获取元素操作对象列表
     *
     * @param {string} expression XPath表达式
     * @returns {Promise<Array<ElementHandle>>}
     */
    async $x(expression: string): Promise<ElementHandle[]> {
        let result = await this.page.$x(expression);
        let elements = [];
        for (let element of result) {
            elements.push(
                new ElementHandle({
                    device: this,
                    element,
                })
            );
        }
        return elements;
    }

    /**
     * 通过 CSS 选择器获取元素操作对象
     *
     * @param selector CSS 选择器
     * @returns {Promise<ElementHandle|null>}
     */
    async $(selector: string): Promise<ElementHandle|null> {
        let element = await this.page.$(selector);
        if (null === element) {
            return null;
        }
        return new ElementHandle({
            device: this,
            element,
        });
    }

    /**
     * 通过 CSS 选择器获取元素操作对象列表
     *
     * @param selector CSS 选择器
     * @returns {Promise<Array<ElementHandle>>}
     */
    async $$(selector: string): Promise<ElementHandle[]> {
        let result = await this.page.$$(selector);
        let elements = [];
        for (let element of result) {
            elements.push(
                new ElementHandle({
                    device: this,
                    element,
                })
            );
        }
        return elements;
    }

    /**
     * 屏幕点击
     *
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @return <Promise>
     */
    async tap(x: number, y: number): Promise<any> {
        let res = await this.page.touchscreen.tap(x, y);
        return res;
    }

    /**
     * 页面滑动
     *
     * @param {number} fx 起点横坐标
     * @param {number} fy 起点纵坐标
     * @param {number} tx 终点横坐标
     * @param {number} ty 终点纵坐标
     */
    async swipe(fx: number, fy: number, tx: number, ty: number): Promise<void> {
        await this.page.mouse.move(fx, fy);
        await this.page.mouse.wheel({ deltaX: fx - tx, deltaY: fy - ty });
    }

    /**
     * 跳转 HTTP 地址
     *
     * @param {string} path url 路径
     * @returns {string}
     */
    async goto(path: string = ''): Promise<string> {
        for (let index = 0; index < 3; index++) {
            try {
                await this.page.goto(path, { waitUntil: 'networkidle2' });
                break;
            } catch (err: any) {
                logger.error(`[web.goto] page.goto fail ${index + 1} times: ${err.message}`);
                continue;
            }
        }

        return path;
    }

    /**
     * 获取页面宽高
     *
     * @return {object} screenSize
     * @return {number} screenSize.width 宽度，单位是像素
     * @return {number} screenSize.height 高度，单位是像素
     */
    async getScreenSize(): Promise<object> {
        if (this.emulate) {
            let res = await this.page.viewport();
            if (null === this.screenSize) {
                this.screenSize = {
                    width: res.width * res.deviceScaleFactor,
                    height: res.height * res.deviceScaleFactor,
                };
            }
        } else {
            let { width, height } = await this.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    deviceScaleFactor: window.devicePixelRatio,
                };
            });
            this.screenSize = {
                width,
                height,
            };
        }
        return this.screenSize;
    }

    /**
     * 截图
     *
     * @param {string} path     图片路径
     * @returns {Promise{Buffer|String}}
     */
    async screenshot(path: string): Promise<Buffer | string> {
        let res = await this.page.screenshot(path);
        if (path) {
            writeFileSync(path, res);
        }
        return res;
    }

    /**
     * 页面 dom 树
     *
     * @return <Promise{string}>
     */
    async source(): Promise<string> {
        let res = await this.page.content();
        return res;
    }

    /**
     * browser version
     *
     * @returns {string} 浏览器版本号
     */
    async version(): Promise<string> {
        let res = await this.browser.version();
        let version = res.split('/')[1];
        return version;
    }

    /**
     * 关闭设备
     */
    async close(): Promise<void> {
        logger.info('[web.close]');
        if (this.page && this.page.close) {
            await this.page.close();
            this.page = null;
        }
        if (this.browser && this.browser.close) {
            await this.browser.close();
            this.browser = null;
        }
    }
};
