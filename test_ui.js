import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('[TEST] Navigating to Dashboard...');
    await page.goto('http://localhost:4000/');
    await new Promise(r => setTimeout(r, 2000));

    const dashboardPath = path.join(process.cwd(), 'dashboard_ui_v2.png');
    await page.screenshot({ path: dashboardPath });
    console.log(`[TEST] Saved: ${dashboardPath}`);

    console.log('[TEST] Navigating to Wallet Manager...');
    await page.goto('http://localhost:4000/wallet');
    await new Promise(r => setTimeout(r, 2000));

    const walletPath = path.join(process.cwd(), 'wallet_ui_v2.png');
    await page.screenshot({ path: walletPath });
    console.log(`[TEST] Saved: ${walletPath}`);

    console.log('[TEST] Navigating to Configurator...');
    await page.goto('http://localhost:4000/config');
    await new Promise(r => setTimeout(r, 2000));

    const configPath = path.join(process.cwd(), 'config_ui_v2.png');
    await page.screenshot({ path: configPath });
    console.log(`[TEST] Saved: ${configPath}`);

    await browser.close();
    process.exit(0);
})();
