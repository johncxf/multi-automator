declare module 'bat-adbkit' {
    export interface AdbClient {
        [x: string]: any;
        uninstall(deviceId: string, appId: string): unknown;
        install(deviceId: string, appPath: string): unknown;
        startActivity(deviceId: string, options: any): unknown;
        forward(deviceId: string, local: string, remote: string): unknown;
        isInstalled(serial: string, packageName: string): unknown;
        shell(serial: string, command: string): Promise<{
            toString(): Promise<string>;
        }>;
        listDevices(): Promise<Array<{id: string; type: string}>>;
        createClient(options: {bin: string; host: string; port: number}): AdbClient;
    }
    
    const adbkit: {
        util: any;
        createClient(options: {bin: string; host: string; port: number}): AdbClient;
    };
    
    export default adbkit;
} 