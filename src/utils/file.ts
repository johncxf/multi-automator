/**
 * @desc: file operate
 * @author: john_chen
 * @date: 2023.03.13
 */
import fs from 'fs';
import { resolve } from 'path';

/**
 * 创建目录
 *
 * @param {string} dir 目录路径
 */
export function mkdir(dir: string): void {
    if (fs.existsSync(dir)) {
        return;
    }
    fs.mkdirSync(dir);
}

/**
 * 删除目录
 *
 * @param {string} dir 目录路径
 */
export function rmdir(dir: string): void {
    dir = resolve(dir);
    if (!fs.existsSync(dir)) {
        return;
    }

    // 去除尾部 /
    if (dir && '/' === dir.slice(-1)) {
        dir = dir.slice(0, dir.length - 1);
    }

    // 文件
    if (!fs.statSync(dir).isDirectory()) {
        fs.unlinkSync(dir);
        return;
    }

    // 目录
    for (let file of fs.readdirSync(dir)) {
        rmdir(`${dir}/${file}`);
    }

    // 删除目录
    fs.rmdirSync(dir);
}
