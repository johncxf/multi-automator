/**
 * @desc: iOS Element
 * @author: john_chen
 * @date: 2025.02.15
 */
import { writeFileSync } from 'fs';
import { logger } from '../config';
import IOSHandler from "./Handler";
import { ElementBounds } from '../types';

interface ElementOptions {
    device: IOSHandler;
    element: any;
}


export default class Element {
    device: IOSHandler;
    element: any;

    constructor(options: ElementOptions) {
        this.device = options.device;
        this.element = options.element;
    }

    async tap(): Promise<void> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.tap] ${this.element.ELEMENT}`);
        return await this.device.wda.post(`/element/${this.element.ELEMENT}/click`, {}, { withSession: true });
    }

    async clear(): Promise<void> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.clear] ${this.element.ELEMENT}`);
        return await this.device.wda.post(`/element/${this.element.ELEMENT}/clear`, {}, { withSession: true });
    }

    async input(text: string): Promise<void> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.input] ${this.element.ELEMENT} ${text}`);
        return await this.device.wda.post(
            `/element/${this.element.ELEMENT}/value`, { value: [text] }, { withSession: true }
        );
    }

    async screenshot(path: string): Promise<Buffer> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.screenshot] ${this.element.ELEMENT} ${path}`);
        const base64Data = await this.device.wda.get<string>(
            `/element/${this.element.ELEMENT}/screenshot`, { withSession: true }
        );
        const buffer = Buffer.from(base64Data, 'base64');
        if (path) {
            writeFileSync(path, buffer);
        }
        return buffer;
    }

    async attribute(name: string): Promise<string> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.attribute] ${this.element.ELEMENT} ${name}`);
        return await this.device.wda.get<string>(
            `/element/${this.element.ELEMENT}/attribute/${name}`, { withSession: true }
        );
    }

    async boundingBox(): Promise<ElementBounds> {
        if (!this.device?.wda) {
            throw new Error('WDA client is not initialized');
        }
        logger.info(`[Element.boundingBox] ${this.element.ELEMENT}`);
        return await this.device.wda.get<ElementBounds>(
            `/element/${this.element.ELEMENT}/rect`, { withSession: true }
        );
    }
}
