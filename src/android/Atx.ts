/**
 * @desc: atx operation
 * @author: john_chen
 * @date: 2025.02.22
 */
import axios, { AxiosRequestConfig } from 'axios';
import portFinder from 'portfinder';

import { logger } from '../config';
import { AppInfo } from '../types';
import { currentTimestamp, delay } from '../utils/time';
import { DEVICE_TMP_DIR } from './env';
import * as adb from './adb';

const ATX_NAME = 'atx-agent';
const ATX_PATH = `${DEVICE_TMP_DIR}/${ATX_NAME}`;
const ATX_DEVICE_PORT = 7900;

interface AtxOptions {
    deviceId: string;
    connectType: 'usb' | 'wifi';
    timeout?: number;
}

interface TimeoutResponse {
    success: boolean;
    description: string;
}

interface UiautomatorResponse {
    description: string;
}

interface HttpRequestOptions {
    timeout?: number;
    responseType?: AxiosRequestConfig['responseType'];
}

export default class Atx {
    private readonly id: string;
    private readonly connectType: string;
    private readonly timeout: number;
    private ip: string;
    private port: number | null;
    private atxIsRunning: boolean;
    private uiautomatorIsRunning: boolean;

    constructor({ deviceId, connectType, timeout = 20000 }: AtxOptions) {
        this.id = deviceId;
        this.connectType = connectType;
        this.timeout = timeout;
        this.ip = '127.0.0.1';
        this.port = null;
        this.atxIsRunning = false;
        this.uiautomatorIsRunning = false;
    }

    // 公共接口
    async init(): Promise<void> {
        logger.info('[atx.init]');
        await this.setupConnection();
        await this.restartAtxServer();
        await this.startUiautomator();
    }

    async close(): Promise<void> {
        logger.info('[atx.close]');
        if (this.uiautomatorIsRunning) {
            await this.stopUiautomatorServer();
            this.uiautomatorIsRunning = false;
        }
        if (this.atxIsRunning) {
            await this.stopAtxServer();
            this.atxIsRunning = false;
        }
    }

    async info(): Promise<any> {
        return this.get('/info');
    }

    // 应用包管理
    async packages(): Promise<AppInfo[]> {
        const res = await this.get<any[]>('/packages');
        return res.map(item => ({
            appId: item.packageName,
            version: item.versionName,
            name: item.label
        }));
    }

    async packageInfo(packageName: string): Promise<AppInfo> {
        const { data } = await this.get<any>(`/packages/${packageName}/info`);
        return {
            appId: data.packageName,
            version: data.versionName,
            name: data.label,
            activity: data.mainActivity
        };
    }

    async source(timeout = this.timeout): Promise<string> {
        const res = await this.get<{result: string}>('/dump/hierarchy', { timeout });
        return res.result;
    }

    async deviceInfo(timeout = 20000): Promise<any> {
        let res = await this.jsonrpc('deviceInfo', [], { timeout });
        logger.info(`[atx.deviceInfo] ${JSON.stringify(res)}`);
        return res;
    }

    // TODO: 有点问题、待解决
    async screenshot(timeout = 20000): Promise<Buffer> {
        let res = await this.get<ArrayBuffer>('/screenshot/0', { responseType: 'arraybuffer', timeout });
        return Buffer.from(res);
    }

    // HTTP 请求封装
    private async get<T>(path = '', options?: HttpRequestOptions): Promise<T> {
        const fullPath = path.startsWith('/') ? path : `/${path}`;
        const { timeout = this.timeout, responseType,  } = options || {};
        const baseUrl = `http://${this.ip}:${this.port}`;
        // 构建请求配置
        const config: AxiosRequestConfig = {
            baseURL: baseUrl,
            timeout
        };
        if (responseType) {
            config.responseType = responseType;
        }

        try {
            const { data } = await axios.get<T>(fullPath, config);
            return data;
        } catch (err: unknown) {
            logger.error(`[atx.get] ${baseUrl}${fullPath} ${(err as Error).message}`);
            throw new Error(`[Atx.get] ${fullPath}: ${(err as Error).message}`);
        }
    }

    private async post<T>(path = '', data = {}, options?: HttpRequestOptions): Promise<T> {
        const fullPath = path.startsWith('/') ? path : `/${path}`;
        const { timeout = this.timeout } = options || {};
        try {
            const { data: responseData } = await axios.post<T>(fullPath, data, {
                baseURL: `http://${this.ip}:${this.port}`,
                timeout
            });
            return responseData;
        } catch (err: unknown) {
            if ((err as Error).message.includes('502') && fullPath === '/jsonrpc/0') {
                throw new Error('Jsonrpc 502');
            }
            throw new Error(`[Atx.post] ${fullPath}: ${(err as Error).message}`);
        }
    }
    
    async jsonrpc(method: string, params: any[] = [], options: { timeout?: number } = {}): Promise<any> {
        const { timeout = this.timeout } = options;
        await this.checkUiautomator();
        const requestPayload = {
            jsonrpc: '2.0',
            method,
            id: String(Math.floor(currentTimestamp() / 1000)),
            params
        };

        const res = await this.post<{
            result?: any; 
            error?: { message?: string; data?: string } 
        }>(
            '/jsonrpc/0', 
            requestPayload, 
            { timeout }
        );
        // logger.info(`[atx.jsonrpc] res: ${JSON.stringify(res)}`);
        if (res?.result) {
            return res.result;
        }

        this.handleJsonRpcError(res.error);
    }

    private handleJsonRpcError(error?: { message?: string; data?: string }): void {
        if (error) {
            const errorMessage = error.message || error.data || 'Unknown error occurred';
            throw new Error(errorMessage);
        }
        throw new Error('jsonrpc request failed: no result or error provided');
    }

    // 连接管理
    private async setupConnection(): Promise<void> {
        if (this.connectType === 'usb') {
            this.port = await portFinder.getPortPromise();
            await adb.forward(this.id, `tcp:${this.port}`, `tcp:${ATX_DEVICE_PORT}`);
            logger.info(`[atx.init] forward ${this.id} ${this.port} to ${ATX_DEVICE_PORT}`);
        } else if (this.connectType === 'wifi') {
            this.ip = await adb.ip(this.id);
        } else {
            throw new Error(`不支持连接类型: ${this.connectType}`);
        }
        logger.info(`[atx.init] http://${this.ip}:${this.port}`);
    }

    // ATX Server 管理
    private async restartAtxServer(): Promise<void> {
        await this.stopAtxServer();
        await this.startAtxServer();
    }

    private async startAtxServer(): Promise<void> {
        logger.info('[atx.startAtxServer]');
        let grepAtxCmd = `${ATX_NAME} server --addr=:${ATX_DEVICE_PORT} --nouia -d`;
        for (let ps of ['ps -ef', 'ps']) {
            let grepCmd = `${ps} | grep -v 'grep' | grep '${grepAtxCmd}'`;
            let atxProcesses = await adb.shell(this.id, grepCmd);
            if (atxProcesses) {
                logger.info(`[atx.startAtxServer] ${atxProcesses}`);
                return;
            }
        }

        let startCmd = `${ATX_PATH} server --addr=:${ATX_DEVICE_PORT} --nouia -d`;
        let res = await adb.shell(this.id, startCmd);
        if (res.includes('run atx-agent')) {
            this.atxIsRunning = true;
            logger.info('[atx.startAtxServer] success');
        } else {
            throw new Error(`[atx.startAtxServer] ${res}`);
        }
    }

    private async stopAtxServer(): Promise<void> {
        logger.info('[atx.stopAtxServer]');
        for (let ps of ['ps -ef', 'ps']) {
            let atxProcesses = await adb.shell(this.id, `${ps} | grep -v 'grep' | grep 'atx-agent'`);
            if (atxProcesses) {
                let atxProcessList = atxProcesses.split('\n');
                for (let atxProcess of atxProcessList) {
                    let atxProcessColumns = atxProcess.split(' ');
                    let atxProcessValidColumns = [];
                    for (let atxProcessColumn of atxProcessColumns) {
                        if (
                            0 !== atxProcessValidColumns.length ||
                            atxProcessColumn.startsWith('atx-agent')
                        ) {
                            if ('-d' !== atxProcessColumn) {
                                atxProcessValidColumns.push(atxProcessColumn);
                            }
                        }
                    }
                    let cmd = `${DEVICE_TMP_DIR}/${atxProcessValidColumns.join(' ')} --stop`;
                    let res = await adb.shell(this.id, cmd);
                    if (res.includes('stop server self')) {
                        logger.info('[atx.stopAtxServer] success');
                    } else {
                        throw new Error(`[atx.stopAtxServer] ${res}`);
                    }
                }
            }
        }
    }

    // UIAutomator 管理
    private async startUiautomator(timeout = 20000): Promise<void> {
        logger.info('[atx.startUiautomator]');
        const expiredTime = currentTimestamp() + timeout;
        
        let retryCount = 0;
        while (currentTimestamp() <= expiredTime) {
            try {
                retryCount++;
                await this.startUiautomatorServer();
                await this.setTimeoutUiautomator();
                if (await this.getUiautomatorState()) {
                    this.uiautomatorIsRunning = true;
                    logger.info('[atx.startUiautomator] success');
                    return;
                }
            } catch (err: unknown) {
                logger.error(`[atx.startUiautomator] 启动异常：${(err as Error).message}`);
                // await this.killUiautomatorProcess();
            }
            if (retryCount > 3) {
                logger.info('[atx.startUiautomator] 重启 ATX Server');
                await this.restartAtxServer();
            }
            await delay(1000);
        }
        throw new Error(`[atx.startUiautomator] 耗时 ${timeout} ms 仍未启动`);
    }

    async checkUiautomator(timeout = 15000) {
        logger.info('[atx.checkUiautomator]');
        const expiredTime = currentTimestamp() + timeout;
        do {
            try {
                let isRunning = await this.getUiautomatorState();
                if (isRunning) return;
                await this.startUiautomatorServer();
                await this.setTimeoutUiautomator();
            }
            catch (err) {
                logger.warn('[atx.checkUiautomator] continue');
            }
            await adb.checkConnect(this.id);
            await delay(1000);
        } while (currentTimestamp() <= expiredTime);
        throw new Error(`[atx.checkUiautomator] 超时 ${timeout}ms`);
    }

    private async startUiautomatorServer(): Promise<void> {
        const res = await this.post<UiautomatorResponse>('/services/uiautomator');
        logger.info(`[atx.startUiautomatorServer] ${res.description}`);
        if (!['success', 'already started', 'successfully started'].includes(res.description)) {
            throw new Error(`startUiautomator fail: ${res.description}`);
        }
        logger.info(`[atx.startUiautomatorServer] ${res.description}`);
    }

    private async stopUiautomatorServer(): Promise<void> {
        logger.info('[atx.stopUiautomatorServer]');
        try {
            const res = await axios.delete('/uiautomator', {
                baseURL: `http://${this.ip}:${this.port}`,
                timeout: 6000
            });
            logger.info(`[atx.stopUiautomatorServer] ${res.data}`);
        } catch (err: unknown) {
            logger.error(`[atx.stopUiautomatorServer] ${(err as Error).stack}`);
        }
    }

    private async setTimeoutUiautomator(): Promise<void> {
        const res = await this.post<TimeoutResponse>('/newCommandTimeout', '10800');
        if (!res.success) {
            throw new Error(`setTimeoutUiautomator fail: ${res.description}`);
        }
        logger.info(`[atx.setTimeoutUiautomator] ${res.description}`);
    }

    private async getUiautomatorState(): Promise<boolean> {
        try {
            const { running } = await this.get<{ running: boolean }>('/services/uiautomator');
            logger.info(`[atx.getUiautomatorState] status: ${running}`);
            return running;
        } catch {
            return false;
        }
    }
}
