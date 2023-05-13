/**
 * @desc: Web 元素类
 * @author: john_chen
 * @date: 2023.03.13
 */
import { writeFileSync } from 'fs';
import { ElementHandle } from 'puppeteer-core';

import WebHandler from './Handler';

/**
 * Element Options
 */
export interface ElementOptions {
    /**
     * 设备实例
     */
    device: WebHandler;
    /**
     * 元素对象
     */
    element: ElementHandle;
}

/**
 * web 元素类
 */
export default class Element {
    /**
     * 设备实例
     */
    device: WebHandler;

    /**
     * 元素对象
     */
    element: ElementHandle;

    /**
     * WEB Element Handle
     */
    constructor(options: ElementOptions) {
        let { device, element } = options;
        this.device = device;
        this.element = element;
    }

    /**
     * 获取元素位置
     *
     * @return {Promise{Object}} res
     * @return {number} res.x
     * @return {number} res.y
     * @return {number} res.width
     * @return {number} res.height
     */
    async boundingBox() {
        let res = await this.element.boundingBox();
        return res;
    }

    /**
     * 截屏
     *
     * @param {string} path 存储路径
     * @return {Promise{Buffer}}
     */
    async screenshot(options = { path: '' }) {
        let { path = '' } = options;
        let res = await this.element.screenshot();
        if (path) {
            writeFileSync(path, res);
        }
        return res;
    }

    /**
     * 元素点击
     *
     * @return {Promise}
     */
    async tap() {
        return this.element.tap();
    }

    /**
     * 回车
     *
     * @return {Promise}
     */
    async enter() {
        return this.element.press('Enter');
    }

    /**
     * 对设备元素执行输入操作
     *
     * @param {string} text 要输入的文本
     * @return {Promise}
     */
    async input(text: string) {
        return this.element.type(text);
    }

    /**
     * 获取元素属性值
     *
     * @param {string} name 属性名称
     * @return {string} 属性值
     */
    async attribute(name: string) {
        let res = await (await this.element.getProperty(name)).jsonValue();
        return res;
    }
}
