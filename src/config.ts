/**
 * @desc: 配置文件
 * @author: john_chen
 * @date: 2023.03.13
 */
import { readFileSync } from 'fs';
import { homedir } from 'os';

import * as log from './utils/logger';
import { mkdir } from './utils/file';

const WORK_DIR = `${homedir}/.multi-automator`;
const LOG_DIR = `${WORK_DIR}/logs`;
const TMP_DIR = `${WORK_DIR}/tmp`;
const PKG_DIR = `${WORK_DIR}/packages`;
const BIN_DIR = `${WORK_DIR}/bin`;

mkdir(WORK_DIR);
mkdir(LOG_DIR);
mkdir(TMP_DIR);
mkdir(PKG_DIR);
mkdir(BIN_DIR);

export const logger = log.set(LOG_DIR, 'automator');
logger.info('--- automator start ---');

export const { version } = JSON.parse(readFileSync(`${__dirname}/../package.json`, 'utf8'));

export const dir = {
    work: WORK_DIR,
    log: LOG_DIR,
    tmp: TMP_DIR,
    pkg: PKG_DIR,
    bin: BIN_DIR,
};
