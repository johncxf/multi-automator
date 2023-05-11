/**
 * @desc: log operate
 * @author: john_chen
 * @date: 2023.03.14
 */
import { join } from 'path';
import { createLogger, format } from 'winston';
import moment from 'moment';
import DailyRotateFile from 'winston-daily-rotate-file';

let logger = {} as any;

/**
 * 设置日志句柄
 *
 * @param {string} dir      日志存储目录
 * @param {string} label    日志标识
 * @param {string} level    日志等级
 * @param {string} maxFiles 日志最大存储时间
 * @param {string} maxSize  日志文件最大尺寸
 * @return {Object}
 */
export function set(
    dir: string,
    label: string,
    level: string = 'info',
    maxFiles: string = '3d',
    maxSize: string = '100m'
) {
    if (!dir) {
        throw new Error('参数缺失：dir');
    }
    if (!label) {
        throw new Error('label');
    }
    const myFormat = format.combine(
        format.label({ label }),
        format.printf(({ level, message }) => {// tslint:disable-line
            return `[${process.pid}]` + `[${moment().format('HH:mm:ss')}]` + `[${level}] ${message}`;
        })
    );
    const transports: DailyRotateFile = new DailyRotateFile({
        level,
        maxSize,
        maxFiles,
        filename: join(dir, '%DATE%.log'),
    });
    logger[label] = createLogger({
        level,
        format: myFormat,
        transports,
    });
    return logger[label];
}

/**
 * 获取日志句柄
 *
 * @param {string} label 日志标识
 * @return {Object}
 */
export function get(label: string) {
    if (label) {
        if (logger[label]) {
            return logger[label];
        } else {
            throw new Error('请先初始化日志句柄');
        }
    } else {
        let loggerLabels = Object.keys(logger);
        if (0 === loggerLabels.length) {
            throw new Error('请先初始化日志句柄');
        } else {
            label = loggerLabels[0];
            return logger[label];
        }
    }
}
