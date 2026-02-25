const WebSocket = require('ws');
const { HttpsProxyAgent } = require('https-proxy-agent');

const sessionToken = process.argv[2];
const proxy = process.argv[3] || null;

if (!sessionToken) {
    console.error('Usage: node test_ws.js <token> [proxy]');
    process.exit(1);
}

const url = `wss://api.thenanobutton.com/ws?token=${sessionToken}`;
const options = {
    headers: {
        'Origin': 'https://thenanobutton.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    }
};

if (proxy) {
    console.log(`Using proxy: ${proxy}`);
    options.agent = new HttpsProxyAgent(proxy);
}

const ws = new WebSocket(url, options);

ws.on('open', () => {
    console.log('SUCCESS: WebSocket opened!');
    ws.send(JSON.stringify({ type: 'session', token: sessionToken }));
});

ws.on('message', (data) => {
    console.log('RECV:', data.toString());
});

ws.on('error', (err) => {
    console.error('ERROR:', err.message);
});

ws.on('close', (code, reason) => {
    console.log('CLOSED:', code, reason.toString());
});
