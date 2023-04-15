/**
 * @desc: time operate
 * @author: john_chen
 * @date: 2023.03.13
 */

/**
 * 延时
 *
 * @param {number} 毫秒
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 获取当前时间的时间戳（ms/s)
 *
 * @param {string} type 时间戳类型，毫秒/秒，默认 ms
 * @return {number} 当前时间的时间戳（ms/s）
 */
export function currentTimestamp(type?: string): number {
    type = type || 'ms';
    if (type === 's') {
        return Math.floor(new Date().getTime() / 1000);
    }
    return new Date().getTime();
}
