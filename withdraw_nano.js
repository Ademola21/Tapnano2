const axios = require('axios');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { spawn } = require('child_process');

const sessionToken = process.argv[2];
const nanoAddress = process.argv[3];
const proxy = process.argv[4] || null;
const proxySeed = process.argv[5] || null;
const masterAddress = process.argv[6] || null;

if (!sessionToken || !nanoAddress) {
    console.log('Usage: node withdraw_nano.js <session_token> <nano_address> [proxy] [proxy_seed] [master_address]');
    process.exit(1);
}

const WS_URL = `wss://api.thenanobutton.com/ws?token=${sessionToken}`;
const API_WITHDRAW = 'https://api.thenanobutton.com/api/withdraw';
const TURNSTILE_SERVER = 'http://127.0.0.1:3000/cf-clearance-scraper';

async function getBalance() {
    let attempts = 0;
    while (attempts < 3) {
        attempts++;
        try {
            return await new Promise((resolve, reject) => {
                console.log(`[INFO] Fetching balance (Attempt ${attempts}/3)...`);
                const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
                const ws = new WebSocket(WS_URL, { agent });
                const timeout = setTimeout(() => { ws.terminate(); reject(new Error('Timeout')); }, 20000);
                ws.on('message', (data) => {
                    try {
                        const json = JSON.parse(data.toString());
                        let b = json.balance ?? json.session?.currentNano ?? json.currentNano;
                        if (b !== undefined) { clearTimeout(timeout); ws.close(); resolve(b); }
                    } catch (e) { }
                });
                ws.on('error', (err) => { clearTimeout(timeout); reject(err); });
            });
        } catch (e) {
            console.log(`[WARN] Balance fetch failed: ${e.message}`);
            if (attempts < 3) await new Promise(r => setTimeout(r, 3000));
            else throw e;
        }
    }
}

async function solveTurnstile() {
    console.log('[INFO] Solving CAPTCHA (Turnstile-Max)...');
    let proxyObj = undefined;
    if (proxy) {
        try {
            const u = new URL(proxy);
            proxyObj = { host: u.hostname, port: parseInt(u.port), username: u.username, password: u.password };
        } catch (e) { }
    }
    const res = await axios.post(TURNSTILE_SERVER, {
        mode: 'turnstile-max',
        url: 'https://thenanobutton.com/',
        proxy: proxyObj
    }, { timeout: 70000 });
    if (res.data && res.data.token) return res.data.token;
    throw new Error(res.data.message || 'Solver empty');
}

async function withdraw(amount) {
    let currentToken = null;
    let attempts = 0;
    const maxAttempts = 6;

    while (attempts < maxAttempts) {
        currentToken = null; // Start clean
        console.log(`[INFO] Withdrawal request ${attempts}/${maxAttempts} (Proceeding WITHOUT token)...`);

        try {
            const res = await axios.post(API_WITHDRAW,
                { token: sessionToken, address: nanoAddress, amount: amount, turnstileToken: currentToken || undefined },
                {
                    headers: {
                        'Origin': 'https://thenanobutton.com',
                        'Referer': 'https://thenanobutton.com/',
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                    },
                    httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
                    timeout: 40000
                }
            );

            if (res.status === 200 || res.status === 204) {
                console.log('[SUCCESS] Tokens secure! Withdrawal complete.');
                return true;
            }
        } catch (e) {
            const msg = e.response?.data?.message || e.message || '';
            const isCaptcha = e.response?.data?.captchaRequired || msg.toLowerCase().includes('captcha');

            if (isCaptcha) {
                console.log('[ALERT] API requested CAPTCHA.');
                if (currentToken) {
                    console.error('[ERROR] Token was rejected. Context mismatch or flagged IP.');
                    return false;
                }
                try {
                    currentToken = await solveTurnstile();
                    continue; // Loop again with the token
                } catch (err) {
                    console.error(`[ERROR] Solver failed: ${err.message}`);
                    return false;
                }
            }

            const isNetwork = msg.includes('socket hang up') || msg.includes('ECONNRESET') || msg.includes('timeout');
            if (isNetwork && attempts < maxAttempts) {
                console.log(`[WARN] Network hiccup (${msg}). Retrying in 1s...`);
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            console.error(`[ERROR] Fatal: ${msg}`);
            return false;
        }
    }
    return false;
}

async function main() {
    try {
        const balance = await getBalance();
        console.log(`[INFO] Balance to secure: ${balance}`);
        if (balance <= 0) process.exit(0);

        if (await withdraw(balance)) {
            console.log('[FINISH] Withdrawal successful.');
            if (proxySeed && masterAddress) {
                console.log('[INFO] Immediate consolidation triggered...');
                await new Promise(r => setTimeout(r, 500));
                const p = spawn('node', ['consolidator.js', proxySeed, masterAddress], { stdio: 'inherit' });
                p.on('close', (c) => process.exit(c));
            } else {
                process.exit(0);
            }
        } else {
            console.log('[FAIL] Withdrawal cycle failed.');
            process.exit(1);
        }
    } catch (e) {
        console.error(`[CRITICAL] Error: ${e.message}`);
        process.exit(1);
    }
}

main();
