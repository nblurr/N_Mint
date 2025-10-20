import axios from 'axios';
import { performance } from 'perf_hooks';

const flashbotsRpcs = [
    'https://rpc.mevblocker.io/',
    'https://rpc.payload.de/',
    'https://rpc.titanbuilder.xyz/',
    'https://builder0x69.io/',
    'https://rpc.flashbots.net/fast?hint=hash&blockRange=1'
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

    for (let i = 0; i < numRequests; i++) {
        const start = performance.now();
        try {
            if (isUnsupported) {
                await axios.head(url, { timeout: 3000, validateStatus: () => true });
            } else {
                await axios.post(url, payload, { timeout: 3000 });
            }
            const end = performance.now();
            times.push(end - start);
        } catch (err) {
            console.log(err);
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