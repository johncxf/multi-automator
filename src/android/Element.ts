/**
 * @desc: Android Element
 * @author: john_chen
 * @date: 2025.02.15
 */
import { writeFileSync } from 'fs';
import { logger } from '../config';
import AndroidHandler from './Handler';
import { delay } from '../utils/time';
import * as adb from './adb';
import { ElementBounds } from '../types';
import { extract } from '../utils/image';

interface ElementOptions {
    device: AndroidHandler;
    bounds: ElementBounds;
    attributes: any;
}


export default class Element {
    device: AndroidHandler;
    bounds: ElementBounds;
    attributes: any;
    constructor(options: ElementOptions) {
        this.device = options.device;
        this.bounds = options.bounds;
        this.attributes = options.attributes;
    }

    /**
     * 获取元素边界
     */
    async boundingBox(): Promise<ElementBounds> {
        return this.bounds;
    }

    /**
     * 获取元素属性
     */
    async attribute(name: string): Promise<string> {
        return this.attributes.getNamedItem(name).nodeValue;
    }

    /**
     * 点击元素
     */
    async tap(): Promise<void> {
        const { x, y, width, height } = await this.boundingBox();
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        await this.device.tap(centerX, centerY);
        logger.info(`[Element.tap] Tapped at: (${centerX}, ${centerY})`);
    }

    /**
     * 输入文本
     */
    async input(text: string, options: { wait?: number } = {}): Promise<void> {
        const { wait = 2000 } = options;
        const defaultKeyboard = await adb.getDefaultKeyboard(this.device.id);

        try {
            // 切换输入法（会致使失去焦点）
            await adb.changeKeyboard(this.device.id);
            await delay(wait);

            // 点击以获取焦点
            await this.tap();
            await delay(wait);

            // 输入文本
            await this.device.input(text);
        } catch (error) {
            logger.error(`[Element.input] 输入文本失败: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error('输入文本时发生错误');
        } finally {
            // 恢复默认输入法
            await adb.changeKeyboard(this.device.id, defaultKeyboard);
        }
    }

    /**
     * 截图
     */
    async screenshot(path?: string): Promise<Buffer> {
        let res = await this.device.screenshot();
        let bounds = await this.boundingBox();
        logger.info(`[Element.screenshot] Bounds: ${JSON.stringify(bounds)}`);
        let cropped = await extract(res, bounds);
        if (path) {
            writeFileSync(path, cropped);
        }
        return cropped;
    }
}
