// Optimized NMint Script for Fast Ethereum Minting
// Version: Performance-First

import dotenv from 'dotenv';
dotenv.config();

import { sortedFlashbotsRpcs } from './flashbotsSpeedMonitor.mjs';
import { pickWallet } from './mintCoordinator.mjs';

import axios from 'axios';
import { ethers, Wallet, Contract, JsonRpcProvider, WebSocketProvider, toUtf8Bytes } from 'ethers';
import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';
import fs from 'fs';
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const LOG_FILE = 'mint_log.json';




export class NMintFast {
    constructor() {
        this.initVars();
    }

    logUnifiedReport(type, data, source = null) {
        const LOG_FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            source,
            data,
        };

        try {
            // Ensure the log file exists and is a valid JSON array
            if (!fs.existsSync(LOG_FILE)) {
                fs.writeFileSync(LOG_FILE, '[]\n');
            } else {
                const content = fs.readFileSync(LOG_FILE, 'utf8');
                if (!content.trim().startsWith('[') || !content.trim().endsWith(']')) {
                    fs.writeFileSync(LOG_FILE, '[]\n'); // Reset if not a valid JSON array
                }
            }

            let fileContent = fs.readFileSync(LOG_FILE, 'utf8');
            let logs = JSON.parse(fileContent);

            logs.push(logEntry);

            // Check size and trim if necessary
            let stringifiedLogs = JSON.stringify(logs, null, 2);
            while (Buffer.byteLength(stringifiedLogs, 'utf8') > LOG_FILE_SIZE_LIMIT && logs.length > 1) {
                logs.shift(); // Remove oldest entry
                stringifiedLogs = JSON.stringify(logs, null, 2);
            }

            fs.writeFileSync(LOG_FILE, stringifiedLogs + '\n');
        } catch (error) {
            console.error(`Error writing to log file ${LOG_FILE}:`, error);
        }
    }

    initVars() {
        this.walletMintHistory = {}; // address => BigInt balance
        this.mintWarriorWallets = JSON.parse(process.env.WARRIOR_WALLETS);
        this.lastActiveTime = Date.now();
        this.justMintedBySomeoneElse = false;
        this.walletPrivateKey = process.env.PRIVATE_KEY;
        this.competitorWallets = ['0x82a53178e7a7e454ab31eea6063fdca338418f74', '0xa22f1ac02b5fc04f2e355c30aebfd82a7465b250'];
        this.wssRpcProviderUrl = process.env.WSS_RPC;
        this.jsonRpcProviderUrl = process.env.JSON_RPC;
        this.flashbotsRpcProviderUrl = process.env.FLASHBOTS_RPC;
        this.alchemyApiKey = process.env.ALCHEMY_KEY;
        this.etherscanAPIKey = process.env.ETHERSCAN_KEY;
        this.initialTargetMarketPriceFactor = parseFloat(process.env.TG_MARKET_PRICE);
        this.targetMarketPriceFactor = this.initialTargetMarketPriceFactor;
        this.targetLimitPrice = parseFloat(process.env.TG_LIMIT_PRICE);
        this.useFlashbots = process.env.USE_FLASHBOTS?.toLowerCase() === 'true'
        this.sendTx = process.env.SEND_TX?.toLowerCase() === 'true'

        this.authWalletPkey = process.env.AUTH_WALLET_PKEY;
        this.FlashbotsMintingInXBlock = parseFloat(process.env.FLASHBOTS_MINTING_IN_X_BLOCK);
        this.nbInactivityMinutes = 2
        this.isMintTx = false;
        this.firstMintObserved = false; // New: Flag to indicate if at least one mint has been observed
        this.contractAddress = '0xE73d53e3a982ab2750A0b76F9012e18B256Cc243';
        this.maxMintGasLimit = parseFloat(process.env.MAX_MINT_GAS_LIMIT);

        this.initialTipsBoost = 1.5;
        this.tipsBoost = this.initialTipsBoost; // starts neutral
        this.competitorAggressionBoost = 0;
        this.lostMintCounter = 0;
        this.successMintCounter = 0;
        this.consecutiveLostMints = 0; // New: Track consecutive lost mints
        this.maxConsecutiveLostMints = 5; // New: Threshold for resetting parameters
        this.maxTipsBoost = 3.0; // safety cap
        this.minTipsBoost = 0.5;
        this.tipsAdjustStep = 0.3;
        this.resetTipsAfter = 1; // Reset after this many wins
        this.lastMintBlockHistory = []; // Stores the last 5 lastMintBlock values
        this.initialProfitSafetyFactor = 1.0;
        this.profitSafetyFactor = this.initialProfitSafetyFactor; // Safety factor for MIN_PROFIT_USD
        this.initialWalletNBalance = BigInt(0); // Initial N balance of the minting wallet
        this.cumulativeMintGasUsd = 0; // Cumulative gasUsd for our successful mints
        this.previousNBalanceFormatted = 0n; // Initialize previous N balance for logging
        this.disabledRpcs = new Map(); // Stores { rpcUrl -> reEnableTime } for temporarily disabled RPCs

        this.raceMode = false;
        this.raceModeCounter = 0;
        this.raceModeTriggered = false;
        this.competitorLastMintBlock = 0;
        this.maxPriorityFeePerGas = 0n;
        this.averagePriorityFee = 0n;
        this.maxFeePerGas = 0n;
        this.competitorMintHistory = {}; // address => { cumulativeGasUsd, cumulativeN, initialNBalance }

        this.contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastMintingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

        this.ethUsdPrice = 1800;
        this.nUsdUniswapV3Price = 0;
        this.sumMintN = 0;
        this.sumMintPrice = 0;
        this.wallet = null;
        this.nContract = null;
        this.mintGas = BigInt(61000);
        this.mintCost = 0;
        this.wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
        this.poolAddress = '0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2';
        this.poolABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "Collect", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "CollectProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid1", "type": "uint256" }], "name": "Flash", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextOld", "type": "uint16" }, { "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextNew", "type": "uint16" }], "name": "IncreaseObservationCardinalityNext", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Initialize", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "feeProtocol0Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol0New", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1New", "type": "uint8" }], "name": "SetFeeProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Swap", "type": "event" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collect", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collectProtocol", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal0X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal1X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "flash", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }], "name": "increaseObservationCardinalityNext", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "liquidity", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxLiquidityPerTick", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "observations", "outputs": [{ "internalType": "uint32", "name": "blockTimestamp", "type": "uint32" }, { "internalType": "int56", "name": "tickCumulative", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityCumulativeX128", "type": "uint160" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32[]", "name": "secondsAgos", "type": "uint32[]" }], "name": "observe", "outputs": [{ "internalType": "int56[]", "name": "tickCumulatives", "type": "int56[]" }, { "internalType": "uint160[]", "name": "secondsPerLiquidityCumulativeX128s", "type": "uint160[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "positions", "outputs": [{ "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" }, { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" }, { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "protocolFees", "outputs": [{ "internalType": "uint128", "name": "token0", "type": "uint128" }, { "internalType": "uint128", "name": "token1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "feeProtocol0", "type": "uint8" }, { "internalType": "uint8", "name": "feeProtocol1", "type": "uint8" }], "name": "setFeeProtocol", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slot0", "outputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "internalType": "int24", "name": "tick", "type": "int24" }, { "internalType": "uint16", "name": "observationIndex", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }, { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" }, { "internalType": "bool", "name": "unlocked", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }], "name": "snapshotCumulativesInside", "outputs": [{ "internalType": "int56", "name": "tickCumulativeInside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityInsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsInside", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "bool", "name": "zeroForOne", "type": "bool" }, { "internalType": "int256", "name": "amountSpecified", "type": "int256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [{ "internalType": "int256", "name": "amount0", "type": "int256" }, { "internalType": "int256", "name": "amount1", "type": "int256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "int16", "name": "", "type": "int16" }], "name": "tickBitmap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tickSpacing", "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "name": "ticks", "outputs": [{ "internalType": "uint128", "name": "liquidityGross", "type": "uint128" }, { "internalType": "int128", "name": "liquidityNet", "type": "int128" }, { "internalType": "uint256", "name": "feeGrowthOutside0X128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthOutside1X128", "type": "uint256" }, { "internalType": "int56", "name": "tickCumulativeOutside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityOutsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsOutside", "type": "uint32" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];

    }

    async init() {
        this.wssWeb3Provider = new WebSocketProvider(this.wssRpcProviderUrl);
        this.alchemy = new Alchemy({ apiKey: this.alchemyApiKey, network: Network.ETH_MAINNET });
        this.setupWebSocketReconnect();
        this.jsonRpcProvider = new JsonRpcProvider(this.jsonRpcProviderUrl);

        this.authSigner = new Wallet(this.authWalletPkey, this.jsonRpcProvider);
        this.authWalletAddr = this.authSigner.address;
        this.wallet = new Wallet(this.walletPrivateKey, this.wssWeb3Provider);

        this.flashbots = await FlashbotsBundleProvider.create(
            this.jsonRpcProvider,
            this.authSigner,
            this.flashbotsRpcProviderUrl,
            'mainnet'
        );

        this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet);

        // Populate initial N balance
        this.initialWalletNBalance = await this.nContract.balanceOf(this.wallet.address);

        await this.updateFeeHistory();
        await this.updateFees(await this.jsonRpcProvider.getBlock("pending"));

        await this.updateGlobals();
        this.listenForMints();
        this.listenForBlocks();



        setInterval(() => {
            const now = Date.now();
            const minutesSinceActive = (now - this.lastActiveTime) / (1000 * 60);

            console.warn(`⚠️ Inactivity sanity check : Inactive since ` + minutesSinceActive);
            if (minutesSinceActive > this.nbInactivityMinutes) {
                console.warn(`⚠️ Inactivity detected (${minutesSinceActive.toFixed(2)} min). Resetting scriptRun and isMintTx.`);
                this.isMintTx = false;
                this.justMintedBySomeoneElse = false;
                this.lastActiveTime = now;

                this.reconnectWebSocket();
            }
        }, 60000); // check every minute

        setInterval(() => {
            this.reconnectWebSocket();
        }, 300000); // Every 300s

        // New: Update globals every 2 seconds
        // New: Update globals every 2 seconds
        setInterval(async () => {
            await this.updateGlobals();
        }, 2000);

        // New: Periodically check and re-enable disabled RPCs
        setInterval(() => {
            const now = Date.now();
            for (let [rpcUrl, reEnableTime] of this.disabledRpcs.entries()) {
                if (now >= reEnableTime) {
                    this.disabledRpcs.delete(rpcUrl);
                    console.log(`✅ Re-enabling RPC: ${rpcUrl}`);
                }
            }
        }, 60000); // Check every minute
    }

    setupWebSocketReconnect() {

        this.alchemy.ws.on('error', async (err) => {
            console.error(`🚨 WebSocket error: ${err.message}`);
            await this.reconnectWebSocket();
        });
    }

    // 👇 New dynamic pace logic added to adjust TG_MARKET_PRICE factor based on streak and cost
    async adjustMintParametersByStreak() {
        // Check for consecutive lost mints and reset parameters if threshold is met
        if (this.consecutiveLostMints >= this.maxConsecutiveLostMints) {
            console.warn(`
🔥 ${this.maxConsecutiveLostMints} consecutive lost mints detected. Resetting minting parameters.
            `);
            this.targetMarketPriceFactor = this.initialTargetMarketPriceFactor;
            this.tipsBoost = this.initialTipsBoost;
            this.profitSafetyFactor = this.initialProfitSafetyFactor;
            this.consecutiveLostMints = 0; // Reset the counter
            return; // Skip further adjustments in this cycle
        }

        if (!this.mintStreakWin) this.mintStreakWin = 0;
        if (!this.mintStreakLoss) this.mintStreakLoss = 0;
        if (typeof this.targetMarketPriceFactor !== "number") {
            this.targetMarketPriceFactor = parseFloat(process.env.TG_MARKET_PRICE);
        }

        const maxDeltaFactor = 2; // absolute cap on factor (e.g., 20%)
        const deltaStepFactor = 0.20; // step to increase/decrease each time

        const maxDeltaTips = 0.5; // absolute cap on tipsBoost
        const deltaStepTips = 0.1; // step to increase/decrease tipsBoost

        // Predictive Priority Fee
        const competitorPriorityFees = this.getCompetitorPriorityFees();
        const competitorAvgPriorityFee = competitorPriorityFees.length > 0 ? competitorPriorityFees.reduce((a, b) => a + b, 0) / competitorPriorityFees.length : 0;
        const predictivePriorityFee = competitorAvgPriorityFee * 1.2; // 20% buffer

        let directionFactor = 0;
        let directionTips = 0;

        if (this.mintStreakLossPerBlock >= 1 || this.mintStreakLossPerFees >= 1) {
            console.log(`
⚠️ Lost 1+ mints → Price target factor raised by +${deltaStepFactor}, Tips Boost raised by +${deltaStepTips}
            `);
            directionFactor = 1;
            directionTips = 1;
        } else if (this.mintStreakWin >= 2) {
            console.log(`
⚠️ Win 2+ mints → Price target factor reduced by -${deltaStepFactor}, Tips Boost reduced by -${deltaStepTips}
            `);
            directionFactor = -1;
            directionTips = -1;
        }

        // Adjust targetMarketPriceFactor
        let deltaFactor = directionFactor * deltaStepFactor;
        this.targetMarketPriceFactor += deltaFactor;
        const baseFactor = parseFloat(process.env.TG_MARKET_PRICE);
        this.targetMarketPriceFactor = parseFloat(Math.max(baseFactor - maxDeltaFactor, Math.min(baseFactor + maxDeltaFactor, this.targetMarketPriceFactor)).toFixed(6));
        console.log(`
📈 Adjusted targetMarketPriceFactor to ${this.targetMarketPriceFactor} (Δ=${deltaFactor.toFixed(2)}) based on streak.
        `);

        // Adjust tipsBoost
        let deltaTips = directionTips * deltaStepTips;
        this.tipsBoost += deltaTips;
        this.tipsBoost = parseFloat(Math.max(this.minTipsBoost, Math.min(this.maxTipsBoost, this.tipsBoost)).toFixed(2));
        if (predictivePriorityFee > this.tipsBoost) {
            // Instead of directly setting, add a fraction of the difference
            this.tipsBoost = this.tipsBoost + (predictivePriorityFee - this.tipsBoost) * 0.5; // Add 50% of the difference
            console.log(`
⚡ Predictive Priority Fee (${predictivePriorityFee.toFixed(2)}) was higher. Adjusted tipsBoost to ${this.tipsBoost.toFixed(2)}.
            `);
        }
        console.log(`
⚡ Adjusted tipsBoost to ${this.tipsBoost} (Δ=${deltaTips.toFixed(2)}) based on streak.
        `);

        // Decay competitorAggressionBoost
        if (this.competitorAggressionBoost > 0) {
            this.competitorAggressionBoost = Math.max(0, this.competitorAggressionBoost - 0.05); // Decay by 5% each adjustment cycle
            // Ensure it's not NaN
            if (isNaN(this.competitorAggressionBoost)) {
                this.competitorAggressionBoost = 0;
            }
            console.log(`
📉 Decaying competitorAggressionBoost to ${this.competitorAggressionBoost.toFixed(2)}.
            `);
        }
        // Adjust profitSafetyFactor
        const deltaSafetyLoss = 0.01; // Step to increase safety factor on loss
        const deltaSafetyWin = 0.01; // Step to decrease safety factor on win
        const minSafety = 0.2; // Minimum safety factor
        const maxSafety = 1.5; // Maximum safety factor

        if (directionFactor === 1) { // Losing streak
            this.profitSafetyFactor = Math.min(maxSafety, this.profitSafetyFactor + deltaSafetyLoss);
            console.log(`
🛡️ Increasing profitSafetyFactor to ${this.profitSafetyFactor.toFixed(2)} due to losing streak.
            `);
        } else if (directionFactor === -1) { // Winning streak
            this.profitSafetyFactor = Math.max(minSafety, this.profitSafetyFactor - deltaSafetyWin);
            console.log(`
✅ Decreasing profitSafetyFactor to ${this.profitSafetyFactor.toFixed(2)} due to winning streak.
            `);
        }
    }

    async reconnectWebSocket() {
        try {
            // Cleanup listeners
            if (this.alchemy && this.alchemy.ws) {
                this.wssWeb3Provider?.destroy?.();
                const oldAlchemyWs = this.alchemy.ws; // Store old instance
                this.alchemy = null; // Clear reference to old instance
                oldAlchemyWs.removeAllListeners(); // Remove listeners from old instance
                await sleep(1000); // give system a breath
            }

            console.log('🔄 Re-initializing WebSocketProvider and Alchemy...');
            this.alchemy = new Alchemy({ apiKey: this.alchemyApiKey, network: Network.ETH_MAINNET });
            this.wssWeb3Provider = new WebSocketProvider(this.wssRpcProviderUrl);
            this.wallet = new Wallet(this.walletPrivateKey, this.wssWeb3Provider);
            this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet);

            // Optional: re-init your event listeners
            this.listenForMints();
            this.listenForBlocks();

            this.setupWebSocketReconnect();
            console.log('✅ WebSocket reconnected.');
        } catch (e) {
            console.error('❌ Reconnect failed:', e.message);
            setTimeout(() => this.reconnectWebSocket(), 5000); // Retry after 5 seconds
        }
    }


    listenForMints() {
        this.alchemy.ws.on({
            method: AlchemySubscription.MINED_TRANSACTIONS,
            addresses: [{ to: this.contractAddress }],
            includeRemoved: false,
            hashesOnly: false,
        }, async (tx) => {
            this.isMintTx = true;
            this.firstMintObserved = true; // Set flag that a mint has been observed

            const txMaxPriorityFeePerGas = ethers.formatUnits(tx.transaction.maxPriorityFeePerGas, 'gwei');
            const from = tx.transaction.from.toLowerCase();
            const currentBalance = await this.nContract.balanceOf(from);

            let logMessage = '';
            if (!(from in this.walletMintHistory)) {
                this.walletMintHistory[from] = currentBalance;
                logMessage = ` +? (First mint for this wallet since script started)`;
            } else {
                const prevBalance = this.walletMintHistory[from];
                const diff = currentBalance - prevBalance;

                logMessage = ` + ${ethers.formatUnits(diff, 'ether')} N since last mint`;
                this.walletMintHistory[from] = currentBalance; // Update for next time
            }

            const currentBlockNumber = parseInt(tx.transaction.blockNumber, 16);

            const [lastMintBlock, totalSupplyBN] = await Promise.all([
                this.nContract.lastMintingBlock(),
                this.nContract.totalSupply()
            ]);

            const { gap, rewardN: calculatedRewardN } = this.computeGapAndReward(currentBlockNumber, lastMintBlock);

            let lastMintBlockForLog = null; // Initialize to null, will be set from history or fallback

            // Find the lastMintBlock from history that was active just before this transaction
            for (let i = this.lastMintBlockHistory.length - 1; i >= 0; i--) {
                if (this.lastMintBlockHistory[i].blockNumber < (currentBlockNumber - 1)) {
                    if (this.lastMintBlockHistory[i].lastMintBlock != undefined) {
                        lastMintBlockForLog = this.lastMintBlockHistory[i].lastMintBlock;
                        break;
                    } else {
                        console.log('No lastMintBlock found in history');
                        break;
                    }
                }
            }

            // If no suitable historical entry found, use the lastMintBlock from the contract (which is after this transaction)
            if (lastMintBlockForLog === undefined || lastMintBlockForLog === null) {
                lastMintBlockForLog = Number(lastMintBlock); // This is the lastMintBlock after the current transaction
            }

            const rewardNToLog = (currentBlockNumber - lastMintBlockForLog); const totalSupply = Number(ethers.formatUnits(totalSupplyBN, 18));
            let receipt = null;

            for (let i = 0; i < 3; i++) {
                receipt = await this.jsonRpcProvider.getTransactionReceipt(tx.transaction.hash);
                if (receipt) {
                    break;
                }
                console.log(`
Receipt is null or undefined, retrying in 2 seconds... Attempt ${i + 1}/3
                    `);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (!receipt) {
                console.log(`
Unable to get receipt after 3 retries. Exiting function.
                    `);
                return; // Assuming this is within a function that can be exited
            }

            //console.log(JSON.stringify(tx));
            //console.log(JSON.stringify(receipt));

            // Parse as numbers (they're strings in JSON)
            const gasUsed = parseInt(receipt.gasUsed, 10); // 43121
            const effectiveGasPrice = parseInt(receipt.gasPrice, 10); // 218027874 wei

            // Compute in wei (use BigInt for safety, though not strictly needed here)
            const actualGasCostWei = BigInt(gasUsed) * BigInt(effectiveGasPrice); // 9401579954754n

            // Convert to ETH
            const actualGasCostEth = Number(actualGasCostWei) / 1e18; // 0.000009401579954754

            // For USD: Fetch or use current ETH price (example: $3,838.78 from CoinMarketCap on Oct 23, 2025)
            const actualGasCostUsd = actualGasCostEth * this.ethUsdPrice; // 0.03610206702625536            

            // console.log('actualGasCostEth:' + actualGasCostEth);
            // console.log('actualGasCostUsd:' + actualGasCostUsd);

            let rewardUsd = rewardNToLog * (this.nUsdUniswapV3Price || 0);
            const profitUsd = rewardUsd - actualGasCostUsd;
            const meets = profitUsd >= (Number(process.env.MIN_PROFIT_USD ?? 0));



            if (tx.transaction.from.toLowerCase() === this.wallet.address.toLowerCase()) {

                var nbNInCommunityWallet = await this.nContract.balanceOf(this.wallet.address);

                const currentNBalance = await this.nContract.balanceOf(this.wallet.address);

                const initialNBalanceFormatted = ethers.formatUnits(this.initialWalletNBalance, 'ether');

                const currentNBalanceFormatted = ethers.formatUnits(currentNBalance, 'ether');
                this.previousNBalanceFormatted = currentNBalanceFormatted; // Removed duplicate

                let realMint = parseFloat(currentNBalanceFormatted) - parseFloat(this.previousNBalanceFormatted); // Moved outside if block

                const sumMintN = currentNBalanceFormatted - initialNBalanceFormatted;
                let estMintedN = parseInt(tx.transaction.blockNumber, 16) - Number(lastMintBlockForLog);

                if (estMintedN == 0) {
                    estMintedN = sumMintN;
                }

                console.warn(`
===========================
🚀 ✅ ✅ MINTED BY OUR WALLET ✅ ✅ 🚀
===========================
Block:                  ${parseInt(tx.transaction.blockNumber, 16)}
Last Mint Block:        ${Number(lastMintBlockForLog)}
From:                   ${from}
---------------------------
N Minted:               ${realMint} N
N Planned Mint:         ${estMintedN} N
N Minted Value:         ${this.formatUsd(rewardUsd)}
N Mint cost:            ${this.formatUsd(actualGasCostUsd)}
N Cost per unit:        ${this.formatUsd(actualGasCostUsd / realMint)}
---------------------------
Total Gas Paid:         ${this.formatUsd(this.cumulativeMintGasUsd)}
Total N Minted:         ${sumMintN} N
Total Avg Cost per N:   ${this.formatUsd(this.cumulativeMintGasUsd / Math.max(1, sumMintN))}
---------------------------
N Initial Balance:      ${initialNBalanceFormatted} N
N Previous Balance:     ${this.previousNBalanceFormatted} N
N Actual Balance:       ${currentNBalanceFormatted} N
===========================
        `);

                this.mintStreakLossPerBlock = 0;
                this.mintStreakLossPerFees = 0;
                this.mintStreakWin = (this.mintStreakWin || 0) + 1;
                this.consecutiveLostMints = 0;
            }


            listenForBlocks() {
                this.alchemy.ws.on('block', async (blockNumber) => {
                    console.log(' ');
                    console.log('');
                    // NEW: render next block estimation
                    let nextBlockNumber = blockNumber + 1;
                    const { meets, pendingBlock } = await this.renderNextBlockReport(nextBlockNumber);

                    if (this.raceModeTriggered && (nextBlockNumber - this.competitorLastMintBlock) <= 1) {
                        console.log('🏁 Competitor just minted. Skipping this block to avoid low reward.');
                        return;
                    }

                    // console.log('MINTING TEST ' + this.isMintTx + ' ' + this.sendTx + ' ' + meets);
                    if (this.isMintTx == true || this.sendTx == false || meets == false)
                        return;

                    // console.log('MINTING INIT ' + this.isMintTx + ' ' + this.sendTx + ' ' + meets);

                    this.lastActiveTime = Date.now();

                    try {
                        const block = await this.jsonRpcProvider.getBlock("pending");
                        const mintTimestamp = block.timestamp * 1000; // in milliseconds
                        const selectedWallet = pickWallet(mintTimestamp, this.mintWarriorWallets);

                        let lastMintBlockForLog = null; // Initialize to null, will be set from history or fallback
                        const [lastMintBlock] = await Promise.all([
                            this.nContract.lastMintingBlock()
                        ]);

                        // Find the lastMintBlock from history that was active just before this transaction
                        for (let i = this.lastMintBlockHistory.length - 1; i >= 0; i--) {
                            if (this.lastMintBlockHistory[i].blockNumber < block) {
                                if (this.lastMintBlockHistory[i].lastMintBlock != undefined) {
                                    lastMintBlockForLog = this.lastMintBlockHistory[i].lastMintBlock;
                                    break;
                                } else {
                                    console.log('No lastMintBlock found in history');
                                    break;
                                }
                            }
                        }
                        //console.log('lastMintBlockForLog ' + lastMintBlockForLog + ' lastMintBlock ' + lastMintBlock);
                        // If no suitable historical entry found, use the lastMintBlock from the contract (which is after this transaction)
                        if (lastMintBlockForLog === undefined || lastMintBlockForLog === null) {
                            lastMintBlockForLog = Number(lastMintBlock); // This is the lastMintBlock after the current transaction
                        }

                        // console.log('Mint warrior picked wallet ' + selectedWallet);
                        if (this.wallet.address == selectedWallet && this.isMintTx == false && this.sendTx == true && this.firstMintObserved) {
                            //console.log('');
                            //console.log(`🚀 Let's mint ' Minting at block ${nextBlockNumber}' lastMintBlockForLog ${lastMintBlockForLog}`);
                            await this.mintTokenOp(nextBlockNumber, pendingBlock);
                        } else if (!this.firstMintObserved) {
                            console.log(`⚠️ Waiting for first mint to be observed before initiating our wallet minting.`);
                        }
                        else {
                            console.log(`⚠️ Don't mint yet !`);
                        }

                    } catch (e) {
                        console.log('⚠️ Block handler error:', e.message);
                    }
                });
            }

    async updateFeeHistory() {
                const feeHistory = await this.jsonRpcProvider.send("eth_feeHistory", [
                    "0x14", // Number of blocks to look back (20 blocks)
                    "latest",
                    [20] // Percentiles for rewards (20th percentile)
                ]);

                const rewards = feeHistory.reward.map(r => BigInt(r[0])); // r[0] is the 20th percentile
                const sumRewards = rewards.reduce((acc, val) => acc + val, 0n);
                this.averagePriorityFee = (sumRewards / BigInt(rewards.length));
            }

    async updateFees(pendingBlock) {
                // Get the base fee of the latest block
                const baseFeePerGas = BigInt(pendingBlock.baseFeePerGas);

                //console.log('updateFees 1');
                // Add a buffer to the baseFeePerGas for the maxFeePerGas to account for potential increases
                // EIP-1559 base fee can increase by max 12.5% per block
                const nextBlockBaseFee = baseFeePerGas + (baseFeePerGas / 8n);

                //console.log('updateFees 2');
                const boostedPriorityFeeFactor = this.tipsBoost + this.competitorAggressionBoost;

                //console.log('updateFees 3');
                const maxPriorityFee = BigInt(Math.round(Number(this.averagePriorityFee) * boostedPriorityFeeFactor));

                //console.log('updateFees 4');
                const maxFee = nextBlockBaseFee + maxPriorityFee;

                //console.log('updateFees 5');
                this.gwei = ethers.formatUnits(baseFeePerGas, 'gwei');
                //console.log('updateFees 6');
                this.maxPriorityFeePerGas = maxPriorityFee;
                //console.log('updateFees 7');
                this.maxFeePerGas = maxFee;

                //console.log('updateFees 8');
                this.mintCost = (Number(this.mintGas) * Number(baseFeePerGas) * this.ethUsdPrice) / 1e18;
                //console.log('updateFees 9');
                this.mintCostWithTips = (Number(this.mintGas) * Number(baseFeePerGas + maxPriorityFee) * this.ethUsdPrice) / 1e18;

                return baseFeePerGas;
            }

    async updateGlobals() {
                this.ethUsdPrice = await this.getEthUsdPrice();
                this.mintGas = await this.estimateGasTest();

                await this.updateFeeHistory();

                this.nUsdUniswapV3Price = await this.getNUsdPrice();
            }

            /*
                async estimateGas() {
                    try {
                        this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet);
            
                        const transaction = {
                            to: this.contractAddress,
                            from: this.wallet,  // 👈 include this
                            data: this.nContract.interface.encodeFunctionData("mint")
                        };
            
                        console.log('Waiting estimations ');
                        var estimGas = await this.jsonRpcProvider.estimateGas(transaction);
                        // console.log(`Estimated Gas: ${estimGas}`);
            
                        if (this.maxMintGasLimit && estimGas > this.maxMintGasLimit) {
                            console.warn(`Estimated gas ${estimGas} exceeds MAX_MINT_GAS_LIMIT ${this.maxMintGasLimit}. Capping to ${this.maxMintGasLimit}.`);
                            return BigInt(Math.floor(this.maxMintGasLimit));
                        }
            
                        return estimGas;
                    } catch (ex) {
                        console.error(`Error estimating gas: ${ex.message}. Using default gas: 61043`);
                        let defaultGas = BigInt(61043);
                        if (this.maxMintGasLimit && defaultGas > this.maxMintGasLimit) {
                            console.warn(`Default gas ${defaultGas} exceeds MAX_MINT_GAS_LIMIT ${this.maxMintGasLimit}. Capping to ${this.maxMintGasLimit}.`);
                            return BigInt(Math.floor(this.maxMintGasLimit));
                        }
                        return defaultGas;
                    }
                }
            */

            logCaller(msg) {
                const err = new Error();
                const stack = err.stack.split('\n');
                // stack[0] = "Error"
                // stack[1] = this function
                // stack[2] = the actual caller
                console.log(msg + 'Called from:', stack[2].trim());
            }

    async estimateGasTest() {
                try {

                    //this.logCaller('estimateGasTest : ');
                    this.jsonRpcProvider = new JsonRpcProvider(this.jsonRpcProviderUrl);
                    this.contractAddress = "0xE73d53e3a982ab2750A0b76F9012e18B256Cc243";
                    this.contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastMintingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

                    this.wallet = new Wallet(this.walletPrivateKey, this.jsonRpcProvider);


                    this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet);

                    const transaction = {
                        to: this.contractAddress,
                        from: this.wallet,  // 👈 include this
                        data: this.nContract.interface.encodeFunctionData("mint")
                    };

                    // console.log('Waiting estimations ');
                    var estimGas = await this.jsonRpcProvider.estimateGas(transaction);
                    // console.log(`Estimated Gas: ${estimGas}`);

                    if (this.maxMintGasLimit && estimGas > this.maxMintGasLimit) {
                        console.warn(`Estimated gas ${estimGas} exceeds MAX_MINT_GAS_LIMIT ${this.maxMintGasLimit}. Capping to ${this.maxMintGasLimit}.`);
                        return BigInt(Math.floor(this.maxMintGasLimit));
                    }
                    if (this.mintGas != estimGas) {
                        console.log(`Estimated gas ${estimGas} different from previous gas ${this.mintGas}. New gas returned : ` + estimGas);
                    }

                    return estimGas;
                } catch (ex) {
                    // console.error(`Error estimating gas: ${ex.message}. Using previous gas: ` + this.mintGas);

                    return this.mintGas;
                }
            }

    async mintTokenOp(blockNumber, pendingBlock) {
                await this.updateFees(pendingBlock);
                this.isMintTx = true;
                this.lastActiveTime = Date.now();

                // Immediately update lastMintBlockHistory when a mint is initiated
                this.lastMintBlockHistory.push({ blockNumber: Number(blockNumber), lastMintBlock: Number(blockNumber) });
                if (this.lastMintBlockHistory.length > 5) {
                    this.lastMintBlockHistory.shift(); // Remove oldest entry
                }

                try {
                    if (this.useFlashbots) {
                        const signedTx = await this.getSignedMintTx(blockNumber);
                        this.walletLastMintBlock = []
                        for (let i = 0; i < 1; i++) {
                            this.walletLastMintBlock.push(blockNumber + i);
                            console.log(`
Let's try mint on block ${(blockNumber + i)}
`);
                            if (this.sendTx)
                                await this.doMintTxOnFlashbots(signedTx, blockNumber + i);
                        }
                    } else {
                        this.walletLastMintBlock = [blockNumber];
                        if (this.sendTx)
                            await this.doMintTxOnPrivate(blockNumber);
                    }
                } catch (err) {
                    console.log('❌ Mint TX Error:', err.message);
                } finally {
                    setTimeout(() => { this.isMintTx = false; }, ((this.FlashbotsMintingInXBlock * 12000) + 10000));
                }
            }


    async getSignedMintTx(blockNumber) {
                const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, 'pending');
                // nonce: ' + nonce);
                const tx = {
                    to: this.contractAddress,
                    data: this.nContract.interface.encodeFunctionData("mint"),
                    nonce,
                    blockNumber: BigInt(blockNumber),
                    gasLimit: this.mintGas,
                    maxPriorityFeePerGas: this.maxPriorityFeePerGas,
                    maxFeePerGas: this.maxFeePerGas,
                    type: 2,
                    chainId: 1
                };

                return await this.wallet.signTransaction(tx);
            }

    async getSignedDummyTx(blockNumber) {
                const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, 'pending');
                // console.log('getSignedDummyTx nonce: ' + nonce);
                const dummyTx = await this.wallet.signTransaction({
                    to: this.wallet.address,
                    blockNumber: BigInt(blockNumber),
                    value: 0,
                    nonce: nonce + 1, // one after your mint tx
                    gasLimit: 21000n,
                    maxFeePerGas: this.maxFeePerGas,
                    maxPriorityFeePerGas: this.maxPriorityFeePerGas,
                    type: 2,
                    chainId: 1
                });

                return dummyTx;
            }

    async getMintTx() {

                const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, "pending");

                console.log('MINT TRIAL - base: ' + this.gwei +
                    ' maxFeePerGas: ' + ethers.formatUnits(this.maxFeePerGas, 'gwei') +
                    ' maxPriorityFeePerGas: ' + ethers.formatUnits(this.maxPriorityFeePerGas, 'gwei'));
                const tx = {
                    to: this.contractAddress,
                    data: this.nContract.interface.encodeFunctionData("mint"),
                    nonce,
                    gasLimit: this.mintGas,
                    maxFeePerGas: this.maxFeePerGas,
                    maxPriorityFeePerGas: this.maxPriorityFeePerGas,
                    type: 2,
                    chainId: 1
                };

                return tx;
            }

    async doMintTxOnPrivate(blockNumber) {
                console.log('Mint with private BlockNumber');

                const signedTx = await this.getSignedMintTx(blockNumber);

                await this.jsonRpcProvider.send("eth_sendPrivateTransaction", [{ tx: signedTx, preferences: { fast: true } }]);
            }

    async doMintTxOnFlashbots(signedTx, blockNumber) {
                // Filter out disabled RPCs
                const activeFlashbotsRpcs = sortedFlashbotsRpcs.filter(rpcUrl => {
                    const reEnableTime = this.disabledRpcs.get(rpcUrl);
                    if (reEnableTime && reEnableTime > Date.now()) {
                        return false; // RPC is disabled
                    }
                    if (reEnableTime && reEnableTime <= Date.now()) {
                        this.disabledRpcs.delete(rpcUrl); // Re-enable RPC
                        console.log(`✅ Re-enabling RPC: ${rpcUrl}`);
                    }
                    return true; // RPC is active
                });

                if (activeFlashbotsRpcs.length === 0) {
                    console.warn('❌ No active Flashbots RPCs available.');
                    return;
                }

                await Promise.allSettled(activeFlashbotsRpcs.map(async (rpcUrl) => {
                    try {
                        const bundledTxs = rpcUrl.includes('rpc.mevblocker.io') || rpcUrl.includes('rpc.beaverbuild.org')
                            ? [signedTx, await this.getSignedDummyTx(blockNumber)]
                            : [signedTx];

                        const bundle = {
                            txs: bundledTxs,
                            blockNumber: `0x${(blockNumber).toString(16)}`,
                            minTimestamp: 0,
                            maxTimestamp: 0,
                            revertingTxHashes: [],
                            uuid: randomUUID(),
                        };

                        const body = {
                            jsonrpc: "2.0",
                            id: 1,
                            method: (rpcUrl.includes('rpc.flashbots.net') ? "eth_sendRawTransaction" : "eth_sendBundle"),
                            params: [
                                (rpcUrl.includes('rpc.flashbots.net') ? signedTx : {
                                    txs: bundledTxs,
                                    blockNumber: `0x${(blockNumber).toString(16)}`,
                                    minTimestamp: 0,
                                    maxTimestamp: 0,
                                    revertingTxHashes: [],
                                    droppingTxHashes: [],
                                    uuid: randomUUID(),
                                    refundPercent: 0
                                })
                                ,
                            ],
                        };

                        const message = JSON.stringify(body);
                        const signature = await this.authSigner.signMessage(message);
                        const signerAddress = await this.authSigner.getAddress();
                        const recoveredAddress = ethers.verifyMessage(message, signature);

                        const header = {
                            'Content-Type': 'application/json',
                            'X-Flashbots-Signature': `${signerAddress}:${signature}`,
                        }

                        if (rpcUrl.includes('rpc.flashbots.net')) {
                            if (this.justMintedBySomeoneElse) {
                                console.warn('\n❌ JUST MINTED BY SOMEONE ELSE - MINT BLOCKED\n');
                                return;
                            }
                            const res = await fetch(rpcUrl, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(body)
                            });

                            const result = await res.json();
                            if (result.result) {
                                //console.log(`📦 Bundle submitted to ${rpcUrl}: `);
                            } else if (result.error) {
                                console.error(`❌ Flashbots submission failed: ${result.error.message}`);
                                if (result.error.code === 429) { // Too Many Requests
                                    this.disabledRpcs.set(rpcUrl, Date.now() + 3600000); // Disable for 1 hour
                                    console.warn(`⚠️ Disabling RPC ${rpcUrl} for 1 hour due to 429 error.`);
                                }
                            } else {
                                console.warn(`⚠️ Unknown response from Flashbots`, result);
                            }
                        } else {
                            if (this.justMintedBySomeoneElse) {
                                console.warn('\n❌ JUST MINTED BY SOMEONE ELSE - MINT BLOCKED\n');
                                return;
                            }
                            const res = await axios.post(rpcUrl, body, {
                                headers: header
                            });

                            const result = res.data?.result?.bundleHash || JSON.stringify(res.data || {});

                            //console.log(`📦 Bundle submitted to ${rpcUrl}: `);
                        }
                    } catch (err) {
                        console.warn(`❌ Error submitting to ${rpcUrl}:`, err.response?.data || err.message);
                        if (err.response?.status === 429) { // Too Many Requests
                            this.disabledRpcs.set(rpcUrl, Date.now() + 3600000); // Disable for 1 hour
                            console.warn(`⚠️ Disabling RPC ${rpcUrl} for 1 hour due to 429 error.`);
                        }
                    }
                }));

                //cconsole.log('');
            }

    async logTxReceipt(txHash, ethPrice, nPrice, rewardN, totalSupply, meets, lastMintBlock) {
                const rpcUrl = "https://rpc.mevblocker.io/";

                // 1️⃣ Batch request: transaction, receipt, block
                const payload = [
                    {
                        jsonrpc: "2.0",
                        method: "eth_getTransactionByHash",
                        params: [txHash],
                        id: 1
                    },
                    {
                        jsonrpc: "2.0",
                        method: "eth_getTransactionReceipt",
                        params: [txHash],
                        id: 2
                    }
                ];

                const res = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    if (res.status === 429) {
                        console.warn(`⚠️ RPC request to ${rpcUrl} failed with status 429 (Too Many Requests). Retrying might be needed.`);
                    } else {
                        const errorText = await res.text();
                        console.error(`❌ RPC request failed with status ${res.status}: ${errorText}`);
                    }
                    return null;
                }

                let json;
                try {
                    json = await res.json();
                } catch (e) {
                    const errorText = await res.text();
                    console.error(`❌ Failed to parse JSON response from RPC: ${e.message}. Raw response: ${errorText}`);
                    return null;
                }

                const tx = json.find(r => r.id === 1)?.result;
                const receipt = json.find(r => r.id === 2)?.result;
                if (!tx || !receipt) {
                    console.error("❌ Transaction or receipt not found. Retry");
                    // This retry logic should ideally be handled by the caller if they want to retry logging
                    // For now, we'll just return null and let the caller decide.
                    return null;
                }

                // 2️⃣ Fetch the block to get baseFeePerGas
                const blockRes = await fetch(rpcUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        method: "eth_getBlockByHash",
                        params: [tx.blockHash, false],
                        id: 3
                    })
                });

                const blockData = await blockRes.json();

                if (!blockData.result) {
                    console.error("❌ Block data not found for transaction. Cannot calculate baseFeePerGas.");
                    return null;
                }

                let baseFeeWei = 0;
                if (blockData.result.baseFeePerGas) {
                    baseFeeWei = parseInt(blockData.result.baseFeePerGas, 16);
                } else {
                    console.warn("⚠️ baseFeePerGas not found in block data. Setting to 0 for this transaction.");
                }

                // 3️⃣ Calculate metrics
                const gasUsed = parseInt(receipt.gasUsed, 16);
                const effectiveGasPrice = parseInt(receipt.effectiveGasPrice, 16);
                const priorityFee = effectiveGasPrice - baseFeeWei;

                const gasUsd = this.getTxFeeUsd(receipt, ethPrice);
                const rewardUsd = rewardN * (nPrice || 0);
                const profitUsd = rewardUsd - gasUsd;

                const formatGwei = v => (v / 1e9).toFixed(4);

                const txReceiptData = {
                    hash: tx.hash,
                    blockNumber: parseInt(tx.blockNumber, 16),
                    from: tx.from,
                    to: tx.to,
                    type: tx.type,
                    nonce: tx.nonce,
                    estimatedGasLimit: parseInt(tx.gas, 16),
                    gasUsed: gasUsed,
                    baseFeeWei: baseFeeWei,
                    baseFeeGwei: Number(formatGwei(baseFeeWei)),
                    priorityFee: priorityFee,
                    priorityFeeGwei: Number(formatGwei(priorityFee)),
                    effectiveGasPrice: effectiveGasPrice,
                    effectiveGasPriceGwei: Number(formatGwei(effectiveGasPrice)),
                    totalCostEth: gasUsd / ethPrice,
                    gasUsd: gasUsd,
                    nPrice: nPrice || 0,
                    ethPrice: ethPrice || 0,
                    rewardN: rewardN,
                    rewardUsd: rewardUsd,
                    profitUsd: profitUsd,
                    meets: meets,
                    totalSupply: totalSupply,
                    lastMintBlock: Number(lastMintBlock),
                    status: receipt.status === "0x1" ? "Success" : "Failed",
                };

                // Keep console.log for immediate feedback, but also return the data
                console.log(`
===========================
🚀 Transaction Summary
===========================
Hash:                   ${txReceiptData.hash}
Block:                  ${txReceiptData.blockNumber}
---------------------------
From:                   ${txReceiptData.from}
To:                     ${txReceiptData.to}
Type:                   ${txReceiptData.type}
Nonce:                  ${txReceiptData.nonce}
Estimated Gas Limit:    ${txReceiptData.estimatedGasLimit}
---------------------------
Tx Cost:                ${txReceiptData.totalCostEth.toFixed(8)} ETH (${this.formatUsd(txReceiptData.gasUsd)})
Status:                 ${txReceiptData.status === "Success" ? "✅ Success" : "❌ Failed"}
Last Mint Block:        ${txReceiptData.lastMintBlock}
---------------------------
Gas Used:               ${txReceiptData.gasUsed}
Gas Base:               (${formatGwei(txReceiptData.baseFeeWei)} gwei)
Gas Priority:           (${formatGwei(txReceiptData.priorityFee)} gwei)
Gas Effective Price:    (${formatGwei(txReceiptData.effectiveGasPrice)} gwei)
===========================
`);


                return txReceiptData;
            }

    async getNUsdPrice() {
                const poolContract = new Contract(this.poolAddress, this.poolABI, this.jsonRpcProvider);

                const [slot0, token0] = await Promise.all([
                    poolContract.slot0(),
                    poolContract.token0()
                ]);

                const sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString()); // Convert to BigInt
                const nbToken1ForOneToken0 = (sqrtPriceX96 * sqrtPriceX96) / (BigInt(1) << BigInt(192)); // (p^2) / 2^192

                let tokenPriceInUsd;

                if (token0.toLowerCase() === this.wethAddress) { // WETH address
                    tokenPriceInUsd = Number(this.ethUsdPrice) / Number(nbToken1ForOneToken0);
                }

                return tokenPriceInUsd;
            }

    async fetchTransactionFee(txHash) {
                try {
                    const txReceipt = await this.jsonRpcProvider.getTransactionReceipt(txHash);
                    const tx = await this.jsonRpcProvider.getTransaction(txHash);

                    if (!txReceipt) {
                        return null;
                    }

                    if (!tx) {
                        return null;
                    }

                    const fee = txReceipt.gasUsed * tx.gasPrice;
                    return ethers.formatEther(fee);
                } catch (err) {
                    console.error(`❌ Error fetching transaction fee for ${txHash}:`, err.message || err);
                    return null;
                }
            }



    async getEthUsdPrice() {
                const priceFeed = new Contract(
                    '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
                    [{
                        "inputs": [], "name": "latestRoundData", "outputs": [
                            { "internalType": "uint80", "name": "roundId", "type": "uint80" },
                            { "internalType": "int256", "name": "answer", "type": "int256" },
                            { "internalType": "uint256", "name": "startedAt", "type": "uint256" },
                            { "internalType": "uint256", "name": "updatedAt", "type": "uint256" },
                            { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function"
                    }],
                    this.jsonRpcProvider
                );

                const data = await priceFeed.latestRoundData();
                return Number(data.answer) / 1e8;
            }

            formatUsd(x) {
                return (Number(x) >= 0 ? '$' : '-$') + Math.abs(Number(x)).toFixed(4);
            }

            formatN(x) {
                return Number(x).toLocaleString('en-US', { maximumFractionDigits: 0 });
            }

            getTxFeeUsd(receipt, ethPrice) {
                if (!receipt) {
                    console.warn(`⚠️ getTxFeeUsd: No receipt provided.`);
                    return 0;
                }

                if (receipt.gasUsed === undefined || receipt.gasUsed === null) {
                    console.warn(`⚠️ getTxFeeUsd: receipt.gasUsed is undefined or null for receipt:`, receipt);
                    return 0;
                }
                if (receipt.effectiveGasPrice === undefined || receipt.effectiveGasPrice === null) {
                    console.warn(`⚠️ getTxFeeUsd: receipt.effectiveGasPrice is undefined or null for receipt:`, receipt);
                    return 0;
                }

                const gasUsed = BigInt(receipt.gasUsed);
                const effectiveGasPrice = BigInt(receipt.effectiveGasPrice);
                const fee = gasUsed * effectiveGasPrice;
                const feeEth = ethers.formatEther(fee);
                const feeUsd = feeEth * ethPrice;

                // ${gasUsed}, effectiveGasPrice: ${effectiveGasPrice}, fee: ${fee}, feeEth: ${feeEth}, ethPrice: ${ethPrice}, feeUsd: ${feeUsd}`);

                return feeUsd;
            }
            getCompetitorPriorityFees() {
                try {
                    const logFile = 'mint_log.json';
                    const rawData = fs.readFileSync(logFile);
                    const logs = JSON.parse(rawData);
                    const competitorWallet = '0x82a53178e7a7e454ab31eea6063fdca338418f74';
                    const competitorPriorityFees = [];

                    const transactions = logs.filter(log => log.type === 'transactionReceipt');

                    transactions.forEach(tx => {
                        const data = tx.data;
                        if (data.status === 'Success' && data.from.toLowerCase() === competitorWallet.toLowerCase()) {
                            competitorPriorityFees.push(data.priorityFeeGwei);
                        }
                    });

                    return competitorPriorityFees;
                } catch (error) {
                    console.error('Error reading or parsing log file:', error);
                    return [];
                }
            }

            // Derive "gap+1" reward model seen in your screenshot
            computeGapAndReward(currentBlock, lastMintBlock) {
                const gap = Math.max(0, Number(currentBlock) - Number(lastMintBlock));
                const rewardN = gap; // matches your sample output
                return { gap, rewardN };
            }

    async renderNextBlockReport(nextBlockNumber) {
                // Fetch current on-demand values
                const [contractLastMintBlock, totalSupplyBN, pendingBlock] = await Promise.all([
                    this.nContract.lastMintingBlock(),
                    this.nContract.totalSupply(),
                    this.jsonRpcProvider.getBlock("latest")
                ]);

                let effectiveLastMintBlock = Number(contractLastMintBlock);
                // Check history for a more recent lastMintBlock
                for (const entry of this.lastMintBlockHistory) {
                    if (entry.lastMintBlock > effectiveLastMintBlock) {
                        effectiveLastMintBlock = entry.lastMintBlock;
                    }
                }

                const { gap, rewardN } = this.computeGapAndReward(nextBlockNumber, effectiveLastMintBlock);
                const totalSupply = Number(ethers.formatUnits(totalSupplyBN, 18)); const nPrice = this.nUsdUniswapV3Price;
                const ethPrice = this.ethUsdPrice;

                const currentBaseFeePerGas = pendingBlock.baseFeePerGas;
                const estimatedNextBaseFeePerGas = currentBaseFeePerGas + (currentBaseFeePerGas / 8n);

                // Use current maxPriorityFeePerGas (already updated by updateFees)
                const prioGwei = Number(ethers.formatUnits(this.maxPriorityFeePerGas, 'gwei'));
                const estimatedNextMaxFeePerGas = estimatedNextBaseFeePerGas + this.maxPriorityFeePerGas;

                const baseGwei = Number(ethers.formatUnits(estimatedNextBaseFeePerGas, 'gwei'));
                const maxGwei = Number(ethers.formatUnits(estimatedNextMaxFeePerGas, 'gwei'));

                // Recalculate mintCostWithTips for the next block's estimated fees
                const estimatedMintCostWithTips = (Number(this.mintGas) * Number(estimatedNextBaseFeePerGas + this.maxPriorityFeePerGas) * this.ethUsdPrice) / 1e18;

                const rewardUsd = rewardN * (nPrice || 0);
                const gasUsd = estimatedMintCostWithTips;
                const profitUsd = rewardUsd - gasUsd;

                if (this.raceModeTriggered && (nextBlockNumber - this.competitorLastMintBlock >= 2)) {
                    this.raceMode = true;
                    this.raceModeCounter = 3; // Race for the next 3 blocks
                    this.raceModeTriggered = false;
                    console.log(`
🏎️ Race mode enabled!
            `);
                }

                if (this.raceMode) {
                    this.tipsBoost = 5.0; // 5x priority fee in race mode
                    this.profitSafetyFactor = 0.1; // Lower profit safety factor in race mode
                    this.raceModeCounter--;
                    if (this.raceModeCounter === 0) {
                        this.raceMode = false;
                        console.log('🏎️ Race mode disabled.');
                    }
                }

                // console.log('this.profitSafetyFactor ', this.profitSafetyFactor);
                const meets = profitUsd >= (Number(process.env.MIN_PROFIT_USD ?? 0) * this.profitSafetyFactor);

                const nextBlockReportData = {
                    blockNumber: Number(nextBlockNumber),
                    lastMintBlock: Number(contractLastMintBlock),
                    effectiveLastMintBlock: Number(effectiveLastMintBlock),
                    gap,
                    rewardN,
                    totalSupply,
                    nPrice: nPrice || 0,
                    ethPrice: ethPrice || 0,
                    baseGwei,
                    prioGwei,
                    maxGwei,
                    effectiveGasPriceGwei: baseGwei + prioGwei,
                    gasUsd: gasUsd,
                    profitUsd,
                    rewardUsd,
                    txFeeEth: (gasUsd / ethPrice),
                    txFeeUsd: gasUsd,
                    meets,
                    mintGas: this.mintGas.toString(), // Convert BigInt to string for JSON
                    estimatedNextBaseFeePerGas: estimatedNextBaseFeePerGas.toString(),
                    estimatedMintCostWithTips: estimatedMintCostWithTips,
                };

                this.logUnifiedReport("nextBlockReport", nextBlockReportData, 'next block estimation');

                // Add to history
                this.lastMintBlockHistory.push({ blockNumber: Number(nextBlockNumber), lastMintBlock: Number(effectiveLastMintBlock) });
                if (this.lastMintBlockHistory.length > 5) {
                    this.lastMintBlockHistory.shift(); // Remove oldest entry
                }

                console.log(`
===========================
🔮 NEXT BLOCK ESTIMATE
===========================
Block:              #${nextBlockNumber}
Last Mint Block:    #${Number(contractLastMintBlock)}
Last Trial Block:   #${Number(effectiveLastMintBlock)}
---------------------------
Mint:               ${rewardN} N
Mint Value:         ${this.formatUsd(rewardUsd)}
Tx Cost:            ${this.formatUsd(gasUsd)}
Mint Profit:        ${this.formatUsd(profitUsd)}

Status:             ${meets ? 'SHOULD MINT' : 'DON\'T MINT'}
---------------------------
N Price:            ${(nPrice || 0).toFixed(6)}
ETH Price:          ${this.formatUsd(ethPrice || 0)}
Tx Total fees:      ${(gasUsd / ethPrice).toFixed(18)} ETH
Gas Base:           ${baseGwei.toFixed(4)} Gwei
Gas Priority:       ${prioGwei.toFixed(4)} Gwei
Gas Price:          ${(baseGwei + prioGwei).toFixed(4)} Gwei
Gas Max Gwei:       ${maxGwei.toFixed(4)} Gwei
Gas To Mint:        ${this.mintGas} Unit
===========================
`);


                return { meets, rewardN, profitUsd, pendingBlock };
            }
        }

const instance = new NMintFast();
        instance.init();