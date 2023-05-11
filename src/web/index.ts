/**
 * @desc:
 * @author: john_chen
 * @date: 2023.04.01
 */
import { checkChromium } from './browser';

import WebHandler from './Handler';

/**
 * Init Options
 */
export interface InitOptions {
    browserPath?: string;
    headless?: boolean;
    devtools?: boolean;
    cookies?: object[];
    emulate?: boolean;
    args?: string[];
    ignoreDefaultArgs?: string[] | boolean;
    headers?: object;
}

/**
 * 初始化
 *
 * @param {string} browserPath
 * @param {string} headless
 * @param {string} cookie
 * @param {string} emulate
 * @returns {Promise{object}}
 */
export async function init(options: InitOptions): Promise<WebHandler> {
    let {
        browserPath,
        headless, devtools, args, ignoreDefaultArgs,
        cookies, emulate, headers
    } = options;
    if (undefined === browserPath) {
        browserPath = await checkChromium();
    }
    let webHandler = new WebHandler(browserPath);
    await webHandler.init({ headless, devtools, args, ignoreDefaultArgs }, cookies, emulate, headers);
    return webHandler;
}
