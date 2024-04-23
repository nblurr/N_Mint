function runScript() {
    const privateKey = document.getElementById('privateKey').value;
    const alchemyKey = document.getElementById('alchemyKey').value;
    const etherscanKey = document.getElementById('etherscanKey').value;
    const rpcEndPoint = document.getElementById('rpcEndpoint').value;

    alert (JSON.stringify({ privateKey, alchemyKey, etherscanKey });
    /*
    fetch('https://your-backend-url.com/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privateKey, alchemyKey, etherscanKey })
    })
    .then(response => response.json())
    .then(data => alert('Script run successfully: ' + data.message))
    .catch(error => console.error('Error running script:', error));
    */
}

const { ethers, JsonRpcProvider, utils } = require('ethers');
const axios = require('axios');
const { BigNumber } = require('@ethersproject/bignumber');
const { Alchemy, Network, AlchemySubscription } = require("alchemy-sdk");
const WebSocket = require('ws');
require('dotenv').config();

/* NOTES ABOUT MAIN SCRIPT PARAMETERS 
    - process.env.PRIVATE_KEY: Wallet private key from which the transaction will be mined.
    - process.env.ALCHEMY_API_KEY: API key from an Alchemy account. Create one if needed; it's free.
    - process.env.ETHERSCAN_API_KEY: API key from an Etherscan account. Create one if needed; it's free.
    - process.env.ETH_RPC: Should use a QuickNode RPC with Flashbots Protect and MEV Protect add-ons activated.
    - process.env.TARGET_MARKET_PRICE_FACTOR: Target buy price as a percentage of the actual price 
      (e.g., 0.5 = 50% of the last Uniswap V3 transaction price).
    
    ** Note: If all users of this minter script set the same target price using the above parameter,
       there's a high likelihood of missing mint targets. Setting a target of 50%+ of the actual market price is currently a good strategy to succeed. **
 */

/* TODO / ENHANCEMENTS
    - Enhance the accuracy of N mint cost evaluation.
    - Add spending limits; currently, the script will continue to mint until there are no more ETH funds or the user terminates the process.
    - Improve API and websocket management.
    - Optimize code for better performance and maintainability.
*/

const walletPrivateKey = process.env.PRIVATE_KEY; // An ETH private key is required to proceed to this script

if (!walletPrivateKey) {
    console.error("Private key not found in environment variables. NOT OPTIONAL");
    process.exit(1);
}

var rpcProviderUrl = process.env.ETH_RPC || 'https://fluent-fabled-sailboat.quiknode.pro/yourendpoint/'; // QUICKNODE RPC Endpoint = recommended: flashbot and MEV bot protect add-ons must be activated
const web3Provider = new JsonRpcProvider(rpcProviderUrl);
var alchemyApiKey = process.env.ALCHEMY_API_KEY || 'youralchemykey'; // We using two endpoint for webhook and tx to enhance performance and reduce tx listing potential 

const settings = {
    apiKey: alchemyApiKey,
    network: Network.ETH_MAINNET,
};

var etherscanAPIKey = process.env.ETHERSCAN_API_KEY || 'youretherscanapikey';
var targetMarketPriceFactor = process.env.TARGET_MARKET_PRICE_FACTOR || 0.56; 

const alchemy = new Alchemy(settings);
const contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastMintingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]; // N Contract ABI from Etherscan
const contractAddress = "0xE73d53e3a982ab2750A0b76F9012e18B256Cc243"; // N contract address.
const wallet = new ethers.Wallet(walletPrivateKey, web3Provider); // Investore wallet init on web3 RPC
const nContract = new ethers.Contract(contractAddress, contractABI, wallet); // Contract with investor wallet init 
var estGas = 0;
var estGasPrice = 0;
var gwei = 0;
var mintCost = 0;
var estGasPrice = 0;
var totGas = 0;
var globalSetDone = false;  // Ensure globals has been set at least once
var feeData;
var priorityFee;
var isMintTx = false; // Used to ensure that we will not do 2 tx at same timeframe on the actual script
var lastEthUsdPrice = process.env.ETH_ACTUAL_USD_PRICE || 3200;
var ethUsdPrice = lastEthUsdPrice;
var addTipsGwei = process.env.TIPS_PER_GAS || '3'; // Tips per tx, higher tips does increase chance to get mined fast (But cost a bit more)
var targetMaxPrice = 0.01; // Default target buy price
var previousMintNbMin = process.env.LAST_MINT_WAS_NB_MIN || 3;
var timestampLastTx = new Date(Date.now() - 1000 * (previousMintNbMin * 60));
var wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const poolAddress = process.env.UNISWAP_V3_POOL || '0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2';
const poolABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "Collect", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "CollectProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid1", "type": "uint256" }], "name": "Flash", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextOld", "type": "uint16" }, { "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextNew", "type": "uint16" }], "name": "IncreaseObservationCardinalityNext", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Initialize", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "feeProtocol0Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol0New", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1New", "type": "uint8" }], "name": "SetFeeProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Swap", "type": "event" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collect", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collectProtocol", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal0X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal1X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "flash", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }], "name": "increaseObservationCardinalityNext", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "liquidity", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxLiquidityPerTick", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "observations", "outputs": [{ "internalType": "uint32", "name": "blockTimestamp", "type": "uint32" }, { "internalType": "int56", "name": "tickCumulative", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityCumulativeX128", "type": "uint160" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32[]", "name": "secondsAgos", "type": "uint32[]" }], "name": "observe", "outputs": [{ "internalType": "int56[]", "name": "tickCumulatives", "type": "int56[]" }, { "internalType": "uint160[]", "name": "secondsPerLiquidityCumulativeX128s", "type": "uint160[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "positions", "outputs": [{ "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" }, { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" }, { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "protocolFees", "outputs": [{ "internalType": "uint128", "name": "token0", "type": "uint128" }, { "internalType": "uint128", "name": "token1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "feeProtocol0", "type": "uint8" }, { "internalType": "uint8", "name": "feeProtocol1", "type": "uint8" }], "name": "setFeeProtocol", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slot0", "outputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "internalType": "int24", "name": "tick", "type": "int24" }, { "internalType": "uint16", "name": "observationIndex", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }, { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" }, { "internalType": "bool", "name": "unlocked", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }], "name": "snapshotCumulativesInside", "outputs": [{ "internalType": "int56", "name": "tickCumulativeInside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityInsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsInside", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "bool", "name": "zeroForOne", "type": "bool" }, { "internalType": "int256", "name": "amountSpecified", "type": "int256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [{ "internalType": "int256", "name": "amount0", "type": "int256" }, { "internalType": "int256", "name": "amount1", "type": "int256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "int16", "name": "", "type": "int16" }], "name": "tickBitmap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tickSpacing", "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "name": "ticks", "outputs": [{ "internalType": "uint128", "name": "liquidityGross", "type": "uint128" }, { "internalType": "int128", "name": "liquidityNet", "type": "int128" }, { "internalType": "uint256", "name": "feeGrowthOutside0X128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthOutside1X128", "type": "uint256" }, { "internalType": "int56", "name": "tickCumulativeOutside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityOutsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsOutside", "type": "uint32" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];
var nUsdUniswapV3Price;
var fetch;

// Listen to all mined tx on N contract
alchemy.ws.on(
  {
    method: AlchemySubscription.MINED_TRANSACTIONS,
    addresses: [
      {
        to: contractAddress,
      },
    ],
    includeRemoved: true,
    hashesOnly: false,
  },
  
  (tx) => {
    var nbMinPrevious = minutesDifferenceFromNow(timestampLastTx);
    var nbMintable = ((nbMinPrevious * 60) / 12) + 2; // (NB MIN * 60 secondes) / 12 seconds as 1 N is mintable per this period + 2 as a general buffer
    var pricePerN = (mintCost / nbMintable);

    // Log trace last mined tx results
    console.log("" + new Date().toLocaleTimeString() + " From: " + tx.transaction.from + " Minted: " + nbMintable + " maxFeePerGas: " + hexToGwei(tx.transaction.maxFeePerGas) + " maxPriorityFeePerGas: " + hexToGwei(tx.transaction.maxPriorityFeePerGas) + " Mint cost: " + pricePerN + "$"); 
    timestampLastTx = Date.now();
  }
); // Listen any kind of tx call on the contract. It's a lazy way to check that any kind of tx is run on the contract

// It's the simplest mint orchestrator that could be done: refresh global var each 20 sec + check if we should try a mint each 11 sec
async function mintToken() {
    fetch = (await import('node-fetch')).default;

    // Take last contract tx as the last call to mint... might not be a mint, it's a safety net
    timestampLastTx = await getLastTransactionTime(contractAddress, etherscanAPIKey);

    await setGlobal();
    setInterval(async () => { await  setGlobal() }, (20 *1000)); // Ensure to update global periodicly to reduce nb op on RPC

    mintTokenNow();
    setInterval(async () => { await  mintTokenNow() }, (11000)); // Validate each X time if we should mint per actual targets
}

// FROM N/WETH Uniswap pool
async function getNUsdPrice() {
    const poolContract = new ethers.Contract(poolAddress, poolABI, web3Provider);
    const [slot0, token0, token1] = await Promise.all([
        poolContract.slot0(),
        poolContract.token0(),
        poolContract.token1()
    ]);

    const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString()); // Convert to BigInt
    const nbToken1ForOneToken0 = (sqrtPriceX96 * sqrtPriceX96) / (BigInt(1) << BigInt(192)); // (p^2) / 2^192

    let tokenPriceInUsd;

    if (token0.toLowerCase() === wethAddress) { // WETH address
        const ethPriceInUsd = await getEthUsdPrice(); // This function needs to be implemented or use an API
        tokenPriceInUsd = Number(ethPriceInUsd) / Number(nbToken1ForOneToken0);
    }

    return tokenPriceInUsd;
}

async function getLastTransactionTime(contractAddress, apiKey) {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === "1" && response.data.result.length > 0) {
            const lastTransaction = response.data.result[0];
            return new Date(lastTransaction.timeStamp * 1000);
        } else {
            return Date.now();
        }
    } catch (error) {
        return Date.now()
    }
}

async function setGlobal(){
    try {
        feeData = await web3Provider.getFeeData();

        nUsdUniswapV3Price = await getNUsdPrice();
        targetMaxPrice = nUsdUniswapV3Price * targetMarketPriceFactor; // Target buy price

        maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        priorityFee = ethers.parseUnits(addTipsGwei, 'gwei');
        priorityFeePerGas = maxPriorityFeePerGas + priorityFee;

        gasPrice = feeData.gasPrice;

        estGas = Number(await estimateGas());
        gwei = parseFloat(ethers.formatUnits(estGas, 'gwei'));

        ethUsdPrice = await getEthUsdPrice(); 
        estGasPrice = await getGasPriceEthersJs();

        totGas = estGas * ethers.formatUnits(estGasPrice, 'gwei') / 1000000000;
        mintCost = totGas * ethUsdPrice; // Cost of a mint in USD
        defaultGasLimit = estGas * 2;

        globalSetDone = true; // Ensure globals has been set at least once before trying a mint
    } catch (ex) {
    }
} 

var mintCount = 0; // Used to set some sort of variation on the mint price to try defeating the mint bots

function generateRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

async function mintTokenNow() {
    if(isMintTx == false && globalSetDone == true) {
        try {
           var nbMinPrevious = await minutesDifferenceFromNow(timestampLastTx);
           var nbMintable = ((nbMinPrevious * 60 )/12) + 2;
           var pricePerN = (mintCost/nbMintable);
           var actualPricePerNTarget = targetMaxPrice;

           if(mintCount != 0 ) {
                actualPricePerNTarget = targetMaxPrice + generateRandomBetween(-0.002, 0.002);
           }
            console.log("target : " + actualPricePerNTarget + ", Actual estimated cost per N : " + pricePerN);
           if(pricePerN < actualPricePerNTarget){
                mintCount = (mintCount ==2 ? 0: mintCount+1);

                console.log('' + new Date().toLocaleTimeString() + ' Gaz gwei ' + gwei + ' : Min since last TX: ' +  nbMinPrevious + '  Mintable N: ' + nbMintable + ' Estimated $/N: ' + pricePerN + ' Total est. mint $: ' + mintCost);
                await mintTokenOp();
           }
        } catch (ex) {
            console.log(ex);
        }
    }
}

async function mintTokenOp() {
    if(isMintTx == false) {
        isMintTx = true;

        try {
                var currentNonce = await web3Provider.getTransactionCount(wallet.address, "latest");
            
                if(await minutesDifferenceFromNow(timestampLastTx) > 1){
                    const signedTransaction = await wallet.signTransaction({
                        to: contractAddress,
                        data: nContract.interface.encodeFunctionData("mint"),
                        nonce: currentNonce++,
                        gasLimit: 100000, // Default logical limit
                        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas + priorityFee,
                        maxFeePerGas: (feeData.gasPrice * BigInt(120)) / BigInt(100), // Increased by 20% to encourage miners to pick tx fast
                        type: 2,
                        chainId: 1
                    });    
                    
                    // Send the tx throught Quicknode (Should have activate the Flashbot + MEV protect add-on)
                    const heads = await web3Provider.send("eth_sendPrivateTransaction", [
                    {
                      "tx": signedTransaction,
                      "preferences": {
                        "fast": true,
                      }
                    },
                    ]);
                    
                    console.log("" + new Date().toLocaleTimeString() + " Transaction mined: ", heads);

                    // Force wait 3 minutes before next trial
                    setTimeout( async() => {
                        isMintTx = false; 
                        timestampLastTx = Date.now();
                    }, (((3)  * 60 )*1000));
                }
        } catch (ex) {
            console.log(ex);
            isMintTx = false;
        }
    }
}

function hexToGwei(hexValue) {
    try {
        const decimalValue = BigInt(hexValue);
        const weiToGwei = BigInt("1000000000");
        const gweiValue = decimalValue / weiToGwei;

        return gweiValue.toString();
    } catch (ex){
        return 0;
    }
}

async function estimateGas() {
    try {
        const transaction = {
            to: contractAddress,
            data: nContract.interface.encodeFunctionData("mint")
        };

        const estimGas = await web3Provider.estimateGas(transaction);

        return estimGas;
    } catch (error) {
    }
}

async function getGasPriceEthersJs() {
    try {
        const gasPrice = feeData.gasPrice;
        return gasPrice;
    } catch (error) {
        console.error('Failed to get gas price from ethers.js, falling back to Etherscan:', error.message);
        return null;
    }
}

function minutesDifferenceFromNow(dateToCompare) {
    const now = new Date();
    const differenceInMilliseconds = now - dateToCompare;
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
    
    return differenceInMinutes;
}

async function checkEthBalanceInUsd() {
    const balance = await web3Provider.getBalance(walletAddress);
    const balanceInEth = ethers.formatEther(balance);
    const ethUsdPrice = await getEthUsdPrice();
    const balanceInUsd = (parseFloat(balanceInEth) * ethUsdPrice).toFixed(2);

    return balanceInUsd;
}

async function getEthUsdPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();

        lastEthUsdPrice = data.ethereum.usd;

        return lastEthUsdPrice;
    } catch (ex) {
        return lastEthUsdPrice;
    }

}

mintToken().catch(console.error);
