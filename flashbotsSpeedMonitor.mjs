import axios from 'axios';
import { performance } from 'perf_hooks';
import WebSocket from 'ws';

const flashbotsRpcs = [
    'https://rpc.mevblocker.io/',
    'https://rpc.payload.de/',
    'https://rpc.flashbots.net/fast?hint=hash&blockRange=1',
	'wss://rpc.ankr.com/eth/ws/2aa46279224f67c5888262071339e0a247d0edc43b38c9bf279638316b0319f8',
	'https://twilight-little-arrow.quiknode.pro/d388e71c753e1c7790cfc46f1da455b78478c362/',
	//'https://mainnet.ethereum.validationcloud.io/v1/LFOB26RUagLOBXZjx6SH-rqJvQwPpW_B1PtqzPXkbqM',
	'https://rpc.mevblocker.io/fullprivacy?blockRange=1',
	'https://eth-mainnet.g.alchemy.com/v2/S_RBXZmrSlFXkr4epQJtR65bnSqtX7VL',
	'https://rpc.flashbots.net/fast?hint=hash&blockRange=1',
];

const unsupportedRelays = ['https://rpc.beaverbuild.org/'];

const allRelays = [...flashbotsRpcs, ...unsupportedRelays];

export let sortedFlashbotsRpcs = [...flashbotsRpcs];

const payload = {
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
};

async function testRpcSpeed(url, numRequests = 10) {
    let times = [];
    let errors = 0;
    const isUnsupported = unsupportedRelays.includes(url);
    const isWebSocket = url.startsWith('wss://');

    for (let i = 0; i < numRequests; i++) {
        const start = performance.now();
        try {
            if (isWebSocket) {
                await new Promise((resolve, reject) => {
                    const ws = new WebSocket(url);
                    ws.onopen = () => {
                        ws.send(JSON.stringify(payload));
                    };
                    ws.onmessage = (event) => {
                        // Optionally parse event.data to ensure it's a valid response
                        resolve();
                        ws.close();
                    };
                    ws.onerror = (err) => {
                        reject(err);
                        ws.close();
                    };
                    ws.onclose = () => {
                        // console.log('WebSocket closed');
                    };
                    setTimeout(() => {
                        reject(new Error('WebSocket connection timed out'));
                        ws.close();
                    }, 3000); // Timeout for WebSocket connection/response
                });
            } else if (isUnsupported) {
                await axios.head(url, { timeout: 3000, validateStatus: () => true });
            } else {
                await axios.post(url, payload, { timeout: 3000 });
            }
            const end = performance.now();
            times.push(end - start);
        } catch (err) {
            console.log(`Error testing ${url}: ${err.message}`);
            errors++;
        }
    }

    return {
        url,
        avgTime: times.length ? times.reduce((a, b) => a + b, 0) / times.length : Infinity,
        minTime: times.length ? Math.min(...times) : 0,
        maxTime: times.length ? Math.max(...times) : 0,
        errors
    };
}

async function monitorRpcs(numRequests = 10, interval = 30000) {
    const runTest = async () => {
        //console.log(`\n🧪 RPC Speed Test @ ${new Date().toLocaleTimeString()}`);

        const results = await Promise.allSettled(allRelays.map(url => testRpcSpeed(url, numRequests)));
        const cleanResults = results
            .map(r => r.value)
            .filter(r => r)
            .sort((a, b) => a.avgTime - b.avgTime);

        sortedFlashbotsRpcs = cleanResults.map(r => r.url);
        /*
        console.table(
            cleanResults.map(r => ({
                URL: r.url,
                'Avg (ms)': r.avgTime.toFixed(2),
                'Min (ms)': r.minTime.toFixed(2),
                'Max (ms)': r.maxTime.toFixed(2),
                Errors: r.errors
            }))
        );*/
    };

    await runTest();
    setInterval(runTest, interval);
}

await monitorRpcs();