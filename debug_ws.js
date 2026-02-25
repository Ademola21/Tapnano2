const axios = require('axios');
const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxy = process.argv[2] || null;

async function run() {
    try {
        console.log('Fetching fresh session token...');
        const reqOpts = {
            headers: {
                'Origin': 'https://thenanobutton.com',
                'Referer': 'https://thenanobutton.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        };

        if (proxy) {
            reqOpts.httpsAgent = new HttpsProxyAgent(proxy);
        }

        const res = await axios.get('https://api.thenanobutton.com/api/session', reqOpts);

        const token = res.data.token;
        console.log('Token fetched:', token);

        const url = `wss://api.thenanobutton.com/ws?token=${token}`;
        const options = {
            headers: {
                'Origin': 'https://thenanobutton.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        };

        if (proxy) {
            options.agent = new HttpsProxyAgent(proxy);
        }

        console.log('Connecting to WebSocket...');
        const ws = new WebSocket(url, options);

        ws.on('open', () => {
            console.log('SUCCESS: WebSocket opened!');
            ws.send(JSON.stringify({ type: 'session', token: token }));
        });

        ws.on('message', (data) => {
            console.log('RECV:', data.toString());
        });

        ws.on('error', (err) => {
            console.error('ERROR:', err.message);
        });

        ws.on('close', (code, reason) => {
            console.log('CLOSED:', code, reason.toString());
            process.exit(0);
        });

        setTimeout(() => {
            console.log('Test timed out after 10s');
            ws.close();
        }, 10000);

    } catch (err) {
        console.error('FATAL:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
        }
    }
}

run();
