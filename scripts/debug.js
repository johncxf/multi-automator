/**
 * @desc: 调试
 * @author: john_chen
 * @date: 2023.03.13
 */
const automator = require('../lib/index');


(async () => {
    let cookies = [
        {
            name: '',
            value: '',
            url: 'https://blog.yiqiesuifeng.cn'
        },
        {
            name: '',
            value: '',
            url: 'https://blog.yiqiesuifeng.cn'
        },
        {
            name: '',
            value: '',
            url: 'https://blog.yiqiesuifeng.cn'
        }
    ];
    let webOptions = {
        // browserPath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: false,
        // ignoreDefaultArgs:['--enable-automation', '--enable-blink-features=IdleDetection']
    };
    let device = await automator.launch({ deviceType: 'web', webOptions })
    // console.log(device);
    try {
        // 页面跳转
        await device.goto('https://blog.yiqiesuifeng.cn/');

        // console.log(await device.handler.page.cookies())

        // 获取页面 DOM
        // await device.source({ path: 'page.xml' });

        // 设备截屏
        // await device.screenshot({ path: 'page.png' });

        // 获取页面宽高
        let pageScreenSize = await device.getScreenSize();
        console.log(`page screen size: ${JSON.stringify(pageScreenSize)}`);

        // 获取浏览器版本信息
        let browserVersion = await device.version();
        console.log(`browser version: ${browserVersion}`);

        // // 获取元素对象
        // let navElements = await device.$x('//ul[contains(@class, "nav")]/li[2]');
        // if (navElements.length > 0) {
        //     // 获取元素位置
        //     let eleBoundingBox = await navElements[0].boundingBox();
        //     console.log(`元素位置: ${eleBoundingBox}`);

        //     // 点击
        //     await navElements[0].tap();
        // }

        // await device.$x('//ul[contains(@class, "nav")]/li[2]/a').then(async eles => {
        //     if (eles.length > 0) {
        //         console.log(await eles[0].attribute('href'));
        //     }
        // });
        // await device.$x('//input[contains(@class, "form-control")]').then(async eles => {
        //     if (eles.length > 0) {
        //         await eles[0].input('adb');
        //         await automator.time.delay(1000);
        //         await eles[0].enter();
        //     }
        // });
        // await device.$x('//div[contains(@class, "m-about")]').then(async eles => {
        //     if (eles.length > 0) {
        //         await eles[0].screenshot({ path: 'b.png' });
        //     }
        // });
        // await device.swipe(1000, 3300, 1000, 900);
    } catch(err) {
        throw new Error(err);
    } finally {
        await automator.time.delay(3000);
        await device.close();
    }
})();