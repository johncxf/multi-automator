/**
 * @desc: WebDriverAgent
 * @author: john_chen
 * @date: 2024.12.30
 */
import portFinder from 'portfinder';
import { spawn, spawnSync } from 'child_process';
import { logger } from '../config';
import { currentTimestamp, delay } from '../utils/time';
import axios from 'axios';
import { ScreenSize } from '../types';

interface WDAResponse<T = any> {
    value: T;
    sessionId?: string;
}

interface WDARequestOptions {
    retry?: number;
    duration?: number;
    timeout?: number;
    withSession?: boolean;
}

interface WDACapabilities {
    bundleId: string;
    arguments: string[];
    environment: Record<string, string>;
    shouldWaitForQuiescence: boolean;
    defaultAlertAction: string;
}

export default class WDA {
    /**
     * 设备 UUID
     */
    uuid: string;

    /**
     * WebDriverAgent 项目路径
     */
    wdaProjPath: string;

    /**
     * WebDriverAgent 进程
     */
    webDriverAgent: any;

    /**
     * iProxy 进程
     */
    iProxy: any;

    /**
     * 本地 IP
     */
    ip: string;

    /**
     * 端口号
     */
    port: number;

    /**
     * 超时时间
     */
    timeout: number;

    /**
     * sessionId
     */
    sessionId: string;

    constructor(uuid: string, wdaProjPath: string) {
        this.uuid = uuid;
        this.wdaProjPath = wdaProjPath;
        this.webDriverAgent = null;
        this.iProxy = null;
        this.ip = '127.0.0.1';
        this.port = 0;
        this.timeout = 20000;
        this.sessionId = '';
    }

    async init(): Promise<void> {
        logger.info('[WDA.init]');
        try {
            await this.stop();
            await this.start();
            logger.info('[WDA.init] start success');
        } catch (error) {
            await this.stop();
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`[WDA.init] start failed: ${errorMessage}`);
            throw new Error(`[WDA.init] start failed: ${errorMessage}`);
        }
    }

    /**
     * 启动 WDA
     */
    async start(timeout: number = 90000): Promise<void> {
        const expiredTime = currentTimestamp() + timeout;

        try {
            await this.checkIproxyInstall();
            await this.launchWda();

            this.port = await portFinder.getPortPromise();
            if (!this.port) {
                throw new Error('[WDA.start] allocate port failed');
            }

            this.iProxy = await this.launchIproxy(this.port, 8100);

            // 优化状态检查逻辑
            const isReady = await this.waitForReady(expiredTime);
            if (!isReady) {
                throw new Error(`initialize iOS device timeout ${timeout}ms`);
            }

            await this.initializeSession();
            await this.home();

            logger.info(`[IOS.init] sessionId: ${this.sessionId}`);
        } catch (error) {
            await this.stop();
            throw error;
        }
    }

    /**
     * 停止 WDA
     */
    async stop(): Promise<void> {
        await this.close();
        await this.clear();
    }

    /**
     * 关闭wda不正常结束的进程
     */
    async close(): Promise<void> {
        if (this.webDriverAgent && this.webDriverAgent.kill) {
            this.webDriverAgent.kill('SIGINT');
        }
        logger.info('[IOS.close] close wda process');
        if (this.iProxy && this.iProxy.kill) {
            this.iProxy.kill('SIGINT');
        }
        logger.info('[IOS.close] close iproxy process');
    }

    /**
     * 关闭xcodebuild、iproxy代理进程
     */
    async clear(): Promise<void> {
        spawnSync(`ps -A | grep -v 'grep' | grep 'xcodebuild' | grep ${
            this.uuid
        } | awk '{print $1}' | xargs kill`, {
            shell: true,
            timeout: 20000
        });
        logger.info('[IOS.clear] clear wda process');

        spawnSync(`ps -A | grep -v 'grep' | grep 'iproxy' | grep ${
            this.uuid
        } | awk '{print $1}' | xargs kill`, {
            shell: true,
            timeout: 20000
        });
        logger.info('[IOS.clear] clear iproxy process');
    }

    /**
     * home 键
     *
     * @param {number} timeout 超时时间
     */
    async home(timeout: number = 20000): Promise<void> {
        return await this.post('/wda/homescreen', {}, { timeout, withSession: false });
    }

    /**
     * 启动 APP
     * 
     * @param packageName 包名
     * @returns 
     */
    async launchApp(packageName: string): Promise<void> {
        return await this.post('/wda/apps/launch', {
            bundleId: packageName,
            arguments: [],
            environment: {},
            shouldWaitForQuiescence: false
        }, {
            withSession: true
        });
    }

    /**
     * 终止 APP
     * 
     * @param packageName 包名
     */
    async terminateApp(packageName: string): Promise<void> {
        return await this.post('/wda/apps/terminate', { bundleId: packageName }, {
            withSession: true
        });
    }

    /**
     * 激活 APP
     * 
     * @param packageName 包名
     */
    async activateApp(packageName: string): Promise<void> {
        return await this.post('/wda/apps/activate', { bundleId: packageName }, {
            withSession: true
        });
    }

    /**
     * 获取当前设备页面 dom 树
     *
     * @param {number} timeout 超时时间
     * @returns {Promise<any>}
     */ 
    async getSource(timeout: number = 20000): Promise<any> {
        return await this.get('/source', { timeout, withSession: false });
    }

    /**
     * 获取当前设备屏幕信息
     * 
     * @returns {Promise<any>}
     */ 
    async getScreenInfo(): Promise<any> {
        return await this.get('/wda/screen', { timeout: this.timeout, withSession: true });
    }

    /**
     * 获取屏幕宽高
     */ 
    async getScreenSize(): Promise<ScreenSize> {
        return await this.get('/window/size', { timeout: this.timeout, withSession: true });
    }

    /**
     * 获取当前设备页面截图
     *
     * @returns {Promise<Buffer>}
     */ 
    async screenshot(): Promise<Buffer> {
        const res = await this.get<string>('/screenshot', { timeout: this.timeout, withSession: false });
        return Buffer.from(res, 'base64');
    }

    /**
     * 屏幕点击
     * 
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     */ 
    async tap(x: number, y: number): Promise<void> {
        return await this.post('/wda/tap', { x, y }, { timeout: this.timeout, withSession: true });
    }

    /**
     * 长按屏幕
     * 
     * @param {number} x 横坐标
     * @param {number} y 纵坐标
     * @param {number} duration 长按时间(s)
     */ 
    async longpress(x: number, y: number, duration: number): Promise<void> {
        return await this.post('/wda/touchAndHold', {
            x,
            y,
            duration
        }, { timeout: this.timeout, withSession: true });
    }

    /**
     * 跳转页面（通过safari）
     * 
     * @param {string} url 页面地址
     */
    async openUrl(url: string): Promise<void> {
        return await this.post('/url', { url }, { timeout: this.timeout, withSession: true });
    }

    /**
     * 从某个点滚动到某个点
     * 
     * @param {number} fromX 起点横坐标
     * @param {number} fromY 起点纵坐标
     * @param {number} toX 终点横坐标
     * @param {number} toY 终点纵坐标
     * @param {number} duration 滑动时间
     */ 
    async drag(fromX: number, fromY: number, toX: number, toY: number, duration: number): Promise<void> {
        return await this.post('/wda/dragfromtoforduration', {
            fromX,
            fromY,
            toX,
            toY,
            duration
        }, { withSession: true });
    }

    /**
     * 重新激活当前活动的应用（先home桌面，再打开该应用）
     */
    async deactivateApp(): Promise<void> {
        return await this.post('/wda/deactivateApp', {}, { withSession: true });
    }

    async findElements(using: string, value: string): Promise<any> {
        return await this.post('/elements', { using, value }, { withSession: true });
    }

    /**
     * 等待 WDA 启动
     *
     * @param {number} expiredTime 超时时间
     * @returns {boolean} 是否启动成功
     */
    private async waitForReady(expiredTime: number): Promise<boolean> {
        while (currentTimestamp() < expiredTime) {
            try {
                const response = await this.get<{ ready: boolean }>('/status', { 
                    withSession: false, 
                    timeout: 30000 
                });
                if (response.ready) return true;
            } catch(error: unknown) {
                // 忽略错误，继续尝试
                logger.warn(`[WDA.waitForReady] ${(error as Error).message}`);
            }
            await delay(50);
        }
        return false;
    }

    /**
     * 初始化 WDA 会话
     */
    private async initializeSession(): Promise<void> {
        const capabilities: WDACapabilities = {
            bundleId: 'com.apple.mobilesafari',
            arguments: [],
            environment: {},
            shouldWaitForQuiescence: false,
            defaultAlertAction: 'accept'
        };

        const response = await this.post('/session', {
            desiredCapabilities: capabilities,
            capabilities: {
                alwaysMatch: capabilities
            }
        }, {
            withSession: false,
            timeout: 60000
        });

        const typedResponse = response as { sessionId: string };
        this.sessionId = typedResponse.sessionId;
        if (!this.sessionId) {
            throw new Error('初始化 WDA 会话失败');
        }
    }

    /**
     * 发送 WebDriverAgent GET 请求
     *
     * @param {string} path 请求路径
     * @param {WDARequestOptions} options 请求选项
     * @returns {Promise<T>} 响应数据
     */
    async get<T>(path: string, options: WDARequestOptions): Promise<T> {
        const {
            retry = 3,
            duration = 1000,
            timeout = this.timeout,
            withSession = true
        } = options;

        const fullURL = this.buildURL(path, withSession);
        await delay(1000);

        return this.sendRequest<T>('get', fullURL, undefined, retry, duration, timeout);
    }

    /**
     * 发送 WebDriverAgent POST 请求
     *
     * @param {string} path 请求路径
     * @param {unknown} data 请求数据
     * @param {WDARequestOptions} options 请求选项
     * @returns {Promise<T>} 响应数据
     */
    async post<T>(path: string, data: unknown = {}, options: WDARequestOptions): Promise<T> {
        const {
            retry = 3,
            duration = 1000,
            timeout = this.timeout,
            withSession = true
        } = options;

        const fullURL = this.buildURL(path, withSession);
        await delay(2000);

        return this.sendRequest<T>('post', fullURL, data, retry, duration, timeout);
    }

    /**
     * 发送 WebDriverAgent 请求
     *
     * @param {string} method 请求方法
     * @param {string} url 请求 URL
     * @param {unknown} data 请求数据
     * @param {number} retry 重试次数
     * @param {number} duration 请求间隔时间
     * @param {number} timeout 请求超时时间
     * @returns {Promise<T>} 响应数据
     */
    private async sendRequest<T>(
        method: 'get' | 'post',
        url: string,
        data?: unknown,
        retry: number = 3,
        duration: number = 1000,
        timeout: number = this.timeout
    ): Promise<T> {
        for (let attempt = 0; attempt <= retry; attempt++) {
            try {
                const config = {
                    timeout,
                    headers: { 'Content-Type': 'application/json' }
                };
                
                const response = method === 'get' 
                    ? await axios.get<WDAResponse<T>>(url, config)
                    : await axios.post<WDAResponse<T>>(url, data, config);

                return response.data.value;
            } catch (err) {
                const isConnectionError = err instanceof Error && 
                    ['ECONNRESET', 'ECONNABORTED'].includes((err as any).code);
                
                if (isConnectionError) {
                    await delay(method === 'get' ? 30000 : 10000);
                } else if (attempt === retry) {
                    throw new Error(`WebDriverAgent ${method.toUpperCase()} 请求 ${url} 失败: ${
                        err instanceof Error ? err.message : String(err)
                    }`);
                }
                
                await delay(duration);
            }
        }
        throw new Error(`请求失败: 超过最大重试次数`);
    }

    /**
     * 构建 WebDriverAgent 请求 URL
     *
     * @param {string} path 请求路径
     * @param {boolean} withSession 是否包含会话 ID
     * @returns {string} 请求 URL
     */
    private buildURL(path: string, withSession: boolean): string {
        path = path.startsWith('/') ? path : `/${path}`;
        if (withSession) {
            path = `/session/${this.sessionId}${path}`;
        }
        return `http://${this.ip}:${this.port}${path}`;
    }
    
    /**
     * 检查 iProxy 是否安装
     */
    private async checkIproxyInstall(): Promise<void> {
        let { stderr, status } = spawnSync('iProxy -v', {
            shell: true,
            timeout: 20000
        });
        if (0 !== status) {
            throw new Error(`未正确安装 iProxy: ${
                stderr.toString()
            }，请执行命令 'brew install libimobiledevice' 进行安装`);
        }
    }

    /**
     * 启动 WDA
     */
    private async launchWda(): Promise<void> {
        let wda = spawn('xcodebuild', [
            `-project ${this.wdaProjPath}`,
            '-scheme WebDriverAgentRunner', 
            `-destination "id=${this.uuid}"`,
            'test',
        ], { shell: true });

        await new Promise((resolve, reject) => {
            wda.stdout.on('data', res => {
                if (res.toString().includes('ServerURLHere')) {
                    logger.info('[IOS.launchWda] WDA Start');
                    resolve(true);
                    logger.info(`[WDA ServerURL] ${res.toString()}`);
                }
            });

            wda.stderr.on('data', res => {
                if (res.toString().includes('Testing failed') || res.toString().includes('Failing tests')) {
                    logger.error('[IOS.launchWda] WDA Fail');
                    wda.kill();
                    this.launchWda();
                }
            });

            wda.on('close', code => {
                if (0 !== code) {
                    reject(new Error(`wda 执行异常，请检查 WebDriverAgent.xcodeproj 项目 ${
                        this.wdaProjPath
                    } 是否正确配置: ` + `错误代号-${code}`));
                }
            });
        });
        this.webDriverAgent = wda;
    }

    /**
     * 获取 iProxy 类型
     */
    private async getIproxyType(): Promise<string> {
        let iproxy = 'libusbmuxd';
        let { stdout } = spawnSync('iProxy -v', {
            shell: true,
            timeout: 20000
        });

        if (!stdout.toString().split('\n')[0].startsWith('iproxy')) {
            iproxy = 'usbmuxd';
        }
        return iproxy;
    }

    /**
     * 启动 iProxy
     *
     * @param {number} localIp 本地端口号
     * @param {number} remoteIp 远程端口号
     * @returns {any} iProxy 进程
     */
    private async launchIproxy(localIp: number, remoteIp: number): Promise<any> {
        let iproxyType = await this.getIproxyType();

        let iproxyCmd = ['-u', this.uuid, localIp, remoteIp];
        if (iproxyType === 'usbmuxd') {
            iproxyCmd = [localIp, remoteIp, this.uuid];
        }

        let iProxy = spawn('iproxy', iproxyCmd.map(String), { shell: true });

        iProxy.stdout.on('data', (res: Buffer) => {
            if (res.toString().includes('Creating')) {
                logger.info(`[IOS.launchIproxy] iProxyStdOut: ${
                    res.toString().split('\n')[0]
                }`);
            }
        });

        iProxy.stderr.on('data', res => {
            logger.error(`[IOS.launchIproxy] iProxyStdErr: ${
                res.toString()
            }`);
        });

        iProxy.on('error', err => {
            throw new Error(`iOS iProxy 异常退出:${
                err.message
            }`);
        });
        logger.info(`[IOS.launchIproxy] local:${localIp} remote:${remoteIp}`);

        return iProxy;
    }
}
