/**
 * @desc: image operate
 * @author: john_chen
 * @date: 2025.03.15
 */
import sharp from 'sharp';
import { ElementBounds } from '../types';
import { logger } from '../config';

/**
 * 图像裁切
 *
 * @param {Buffer} imageBuffer
 * @param {Object} bounds
 * @return {Promise{Buffer}}
 */
export async function extract(imageBuffer: Buffer, bounds: ElementBounds): Promise<Buffer> {
    let { x, y, width, height } = bounds;
    // 进 1
    let ceilX = Math.ceil(x);
    let ceilY = Math.ceil(y);
    if (ceilX > x) {
        width = width - (ceilX - x);
    }
    if (ceilY > y) {
        height = height - (ceilY - y);
    }

    // 去掉小数部分
    let floorWidth = Math.floor(width);
    let floorHeight = Math.floor(height);
    if (floorWidth < 1 || floorHeight < 1) {
        throw new Error(`The height and width must be at least 1, received: height=${height} width=${width}`);
    }
    logger.info(`[image.extract] Bounds: ${JSON.stringify({ x: ceilX, y: ceilY, width: floorWidth, height: floorHeight })}`);

    let res = await sharp(imageBuffer).extract({
        left: ceilX,
        top: ceilY,
        width: floorWidth,
        height: floorHeight
    }).png().toBuffer();

    return res;
};
