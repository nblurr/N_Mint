// Optimized NMint Script for Fast Ethereum Minting
// Version: Performance-First

import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { ethers, Wallet, Contract, JsonRpcProvider, WebSocketProvider } from 'ethers';
import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';
import { FlashbotsBundleProvider } from '@flashbots/ethers-provider-bundle';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export class NMintFast {
	constructor() {
		this.initVars();
	}

	initVars() {
		this.walletMintHistory = {}; // address => BigInt balance
		this.lastActiveTime = Date.now();
		this.walletPrivateKey = process.env.PRIVATE_KEY;
		this.wssRpcProviderUrl = process.env.WSS_RPC;
		this.jsonRpcProviderUrl = process.env.JSON_RPC;
		this.flashbotsRpcProviderUrl = process.env.FLASHBOTS_RPC;
		this.alchemyApiKey = process.env.ALCHEMY_KEY;
		this.etherscanAPIKey = process.env.ETHERSCAN_KEY;
		this.targetMarketPriceFactor = parseFloat(process.env.TG_MARKET_PRICE);
		this.targetLimitPrice = parseFloat(process.env.TG_LIMIT_PRICE);
		this.useFlashbots = process.env.USE_FLASHBOTS?.toLowerCase() === 'true'
		this.addTipsGwei = parseFloat(process.env.TX_TIPS_GWEI_POURCENT);
		this.defaultTipsGwei = this.addTipsGwei; // Store base config
		this.authWalletPkey = process.env.AUTH_WALLET_PKEY;
		this.FlashbotsMintingInXBlock = parseFloat(process.env.FLASHBOTS_MINTING_IN_X_BLOCK);
		this.nbInactivityMinutes = 15
		this.scriptRun = true;
		this.isMintTx = false;
		this.contractAddress = '0xE73d53e3a982ab2750A0b76F9012e18B256Cc243';

		this.tipsBoost = 1.0; // starts neutral
		this.lostMintCounter = 0;
		this.successMintCounter = 0;
		this.maxTipsBoost = 3.0; // safety cap
		this.minTipsBoost = 0.5;
		this.tipsAdjustStep = 0.2;
		this.resetTipsAfter = 2; // Reset after this many wins

		this.contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastMintingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

		this.ethUsdPrice = 1800;
		this.pendingTxHash = null;
		this.nUsdUniswapV3Price = 0;
		this.sumMintN = 0;
		this.sumMintPrice = 0;
		this.wallet = null;
		this.nContract = null;
		this.mintGas = BigInt(61000);
		this.pendingTxHash = null;
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
		this.authSigner = new ethers.Wallet(this.authWalletPkey, this.jsonRpcProvider);
		this.authWalletAddr = this.authSigner.address;
		this.wallet = new Wallet(this.walletPrivateKey, this.wssWeb3Provider);
		this.flashbots = await FlashbotsBundleProvider.create(
			this.jsonRpcProvider,
			this.authSigner,
			this.flashbotsRpcProviderUrl,
			'mainnet'
		);

		this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet);

		await this.updateGlobals();

		this.listenForMints();
		this.listenForBlocks();

		setInterval(() => this.updateGlobals(), 140000);

		setInterval(() => {
			const now = Date.now();
			const minutesSinceActive = (now - this.lastActiveTime) / (1000 * 60);

			console.warn(`⚠️ Inactivity sanity check`);
			if (minutesSinceActive > this.nbInactivityMinutes) {
				console.warn(`⚠️ Inactivity detected (${minutesSinceActive.toFixed(2)} min). Resetting scriptRun and isMintTx.`);
				this.scriptRun = true;
				this.isMintTx = false;
				this.lastActiveTime = now;

				reconnectWebSocket();
			}
		}, 60000); // check every minute
	}

	setupWebSocketReconnect() {
		this.alchemy.ws.on('error', async (err) => {
			console.error(`🚨 WebSocket error: ${err.message}`);
			await this.reconnectWebSocket();
		});
	}

	async reconnectWebSocket() {
		try {
			// Cleanup listeners
			if (this.alchemy && this.alchemy.ws) {
				this.alchemy.ws.terminate();
			}

			console.log('🔄 Re-initializing WebSocketProvider and Alchemy...');
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

	adjustTipMultiplier() {
		// Set base tip ranges depending on gas environment
		let minTipPct = 0.01;
		let maxTipPct = 0.05;

		let baseGwei = this.gwei;
		if (baseGwei < 1) {
			minTipPct = 0.30;
			maxTipPct = 0.60;
		} else if (baseGwei < 2) {
			minTipPct = 0.10;
			maxTipPct = 0.25;
		} else if (baseGwei < 4) {
			minTipPct = 0.05;
			maxTipPct = 0.10;
		} else {
			minTipPct = 0.01;
			maxTipPct = 0.05;
		}

		// Define default based on midrange (and store it for resets)
		const defaultTipPct = (minTipPct + maxTipPct) / 2;
		if (!this.defaultTipsGwei || this.defaultTipsGwei === 0) {
			this.defaultTipsGwei = defaultTipPct;
		}

		// Initialize tip if not already
		if (!this.addTipsGwei || this.addTipsGwei === 0) {
			this.addTipsGwei = this.defaultTipsGwei;
		}

		// Loss streak → increase tips, but don't exceed max for this gas tier
		if (this.mintStreakLoss >= 2) {
			this.addTipsGwei *= 1.2;
			this.addTipsGwei = Math.min(this.addTipsGwei, maxTipPct);
			console.log(`⚠️ Lost ${this.mintStreakLoss} mints → tip raised to ${(this.addTipsGwei * 100).toFixed(2)}%`);
		}

		// Win streak → lower tips, but don't go below min for this tier
		else if (this.mintStreakWin >= 2) {
			if (this.addTipsGwei > this.defaultTipsGwei) {
				this.addTipsGwei *= 0.9;
				this.addTipsGwei = Math.max(this.addTipsGwei, minTipPct);
				console.log(`✅ Winning → easing tips to ${(this.addTipsGwei * 100).toFixed(2)}%`);
			} else if (this.addTipsGwei < this.defaultTipsGwei) {
				this.addTipsGwei = this.defaultTipsGwei;
				console.log(`✅ Reset tips to default (${(this.defaultTipsGwei * 100).toFixed(2)}%)`);
			}
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

			const txBase = ethers.formatUnits(tx.transaction.gasPrice, 'gwei');
			const txFeePerGas = ethers.formatUnits(tx.transaction.maxFeePerGas, 'gwei');
			const txMaxPriorityFeePerGas = ethers.formatUnits(tx.transaction.maxPriorityFeePerGas, 'gwei');
			const txFeePourcent = (txMaxPriorityFeePerGas / txBase) * 100;

			const from = tx.transaction.from.toLowerCase();
			const currentBalance = await this.nContract.balanceOf(from);
			const formattedBalance = ethers.formatUnits(currentBalance, 'ether');

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

			if (tx.transaction.from.toLowerCase() === this.wallet.address.toLowerCase()) {
				this.mintStreakLoss = 0;
				this.mintStreakWin = (this.mintStreakWin || 0) + 1;
			} else {
				this.mintStreakWin = 0;
				this.mintStreakLoss = (this.mintStreakLoss || 0) + 1;
			}

			await this.updateGlobals();
			await this.adjustTipMultiplier();

			console.log(parseInt(tx.transaction.blockNumber, 16));

			if (tx.transaction.from.toLowerCase() === this.wallet.address.toLowerCase()) {
				const mintGasCost = await this.fetchTransactionFee(tx.transaction.hash);
				this.sumMintN += 1;
				this.sumMintPrice += parseFloat(mintGasCost);
				console.log(``);

				setTimeout(async () => {
					var nbNInCommunityWallet = await this.nContract.balanceOf(this.wallet.address);
					console.log('');
					console.warn('⚠️ MINTED BY COMMUNITY WALLET ! ' + this.wallet.address + ', NB N : ' + ethers.formatUnits(currentBalance, 18) + logMessage);
					console.log('base: ' + txBase + ' maxFeePerGas: ' + txFeePerGas + ' maxPriorityFeePerGas: ' + txMaxPriorityFeePerGas + ' FeePourcent: ' + txFeePourcent + '%');
					console.log(``);

				}, 12000);



			} else {
				console.log(``);
				console.warn(`⚠️ MINTED BY SOMEONE ELSE ! block ` + console.log(parseInt(tx.transaction.blockNumber, 16)) + ' from ' + tx.transaction.from.toLowerCase() + ', NB N : ' + ethers.formatUnits(currentBalance, 18) + logMessage);


				console.log('base: ' + txBase + ' maxFeePerGas: ' + txFeePerGas + ' maxPriorityFeePerGas: ' + txMaxPriorityFeePerGas + ' FeePourcent: ' + txFeePourcent + '%');
				console.log(``);

			}
			setTimeout(() => { this.isMintTx = false; this.pendingTxHash = null; }, 12000);
		});
	}

	listenForBlocks() {
		this.alchemy.ws.on('block', async (blockNumber) => {
			this.lastActiveTime = Date.now();

			if (!this.scriptRun && !this.isMintTx) return;

			try {
				const nbMintable = await this.getNNBMintable();
				const pricePerN = this.mintCost / (nbMintable);
				const target = this.nUsdUniswapV3Price * this.targetMarketPriceFactor;

				if (pricePerN <= target && pricePerN <= this.targetLimitPrice && !this.isMintTx) {
					console.log('');
					console.log(`🚀 Let's mint ' Minting at block ${blockNumber} Target: ` + target + ` Actual price: ` + pricePerN + ' MintCost ' + this.mintCost + ' Nb Mintable ' + nbMintable + ' MintCostWithTips ' + this.mintCostWithTips);
					await this.mintTokenOp(blockNumber);
				} else {
					console.log(`⚠️ Don't mint yet ! Target: ` + target + ` Actual price: ` + pricePerN + ' MintCost ' + this.mintCost + ' Nb Mintable ' + nbMintable + ' MintCostWithTips ' + this.mintCostWithTips);
				}

			} catch (e) {
				console.log('⚠️ Block handler error:', e.message);
			}
		});
	}

	async updateGlobals() {
		const feeData = await this.jsonRpcProvider.getFeeData();
		const baseFee = feeData.lastBaseFeePerGas ?? feeData.gasPrice ?? BigInt(0);

		this.gwei = await this.getGasPriceInGwei(); // float like 24.3
		const tipsGwei = (this.gwei * this.addTipsGwei); // float

		const safePriority = BigInt(ethers.parseUnits(tipsGwei.toFixed(9), 'gwei'));
		let maxFeePerGas = baseFee + safePriority;

		if (safePriority > maxFeePerGas) {
			maxFeePerGas = safePriority + BigInt(ethers.parseUnits('0.05', 'gwei'));
		}

		this.maxPriorityFeePerGas = safePriority;
		this.maxFeePerGas = maxFeePerGas;
		this.ethUsdPrice = await this.getEthUsdPrice();

		this.mintCost = (Number(this.mintGas) * Number(baseFee) * this.ethUsdPrice) / 1e18;
		this.mintCostWithTips = (Number(this.mintGas) * Number(baseFee + safePriority) * this.ethUsdPrice) / 1e18;
		try {
			this.mintGas = await this.estimateGas();
		} catch (ex) {
			this.mintGas = BigInt(61000);
			console.log("Line 273 " + ex);
			console.log('Use last mintcost as estimateGas = not able to return a value');
		}
		if (this.mintGas != NaN)
			this.mintGas = BigInt(61000);

		this.nUsdUniswapV3Price = await this.getNUsdPrice();

		console.log('');
		console.log('updateGlobals done ');
		console.log('');
	}

	async estimateGas() {
		try {
			const transaction = {
				to: this.contractAddress,
				data: this.nContract.interface.encodeFunctionData("mint")
			};

			var estimGas = await this.jsonRpcProvider.estimateGas(transaction);

			return estimGas;
		} catch (ex) {
			return BigInt(61043); // Default usual value 
		}
	}

	async mintTokenOp(blockNumber) {

		if (this.maxFeePerGas > ethers.parseUnits('15', 'gwei')) {
			// console.log("Skipping overbid tx to save ETH");
			// return;
		}

		this.isMintTx = true;
		this.lastActiveTime = Date.now();

		try {
			if (this.useFlashbots) {
				const signedTx = await this.getSignedMintTx();
				for (let i = 0; i < 2; i++) {
					await this.doMintTxOnFlashbots(signedTx, blockNumber + i);
				}
			} else {
				await this.doMintTxOnPrivate();
			}
		} catch (err) {
			console.log('❌ Mint TX Error:', err.message);
		} finally {
			setTimeout(() => { this.isMintTx = false; this.pendingTxHash = null; }, ((this.FlashbotsMintingInXBlock * 12000) + 2000));
		}
	}

	async getGasPriceInGwei() {
		const gasPrice = await this.jsonRpcProvider.send("eth_gasPrice", []);
		const gasPriceGwei = ethers.formatUnits(gasPrice, "gwei");
		return gasPriceGwei;
	}

	async getSignedMintTx() {
		const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, 'latest');

		console.log('MINT TRIAL - base: ' + this.gwei +
			' maxFeePerGas: ' + ethers.formatUnits(this.maxFeePerGas, 'gwei') +
			' maxPriorityFeePerGas: ' + ethers.formatUnits(this.maxPriorityFeePerGas, 'gwei') +
			' FeePourcent ' + (ethers.formatUnits(this.maxPriorityFeePerGas, 'gwei') / ethers.formatUnits(this.maxFeePerGas, 'gwei') * 100)
		);

		const tx = {
			to: this.contractAddress,
			data: this.nContract.interface.encodeFunctionData("mint"),
			nonce,
			gasLimit: this.mintGas,
			maxPriorityFeePerGas: this.maxPriorityFeePerGas,
			maxFeePerGas: this.maxFeePerGas,
			type: 2,
			chainId: 1
		};

		return await this.wallet.signTransaction(tx);
	}

	async getSignedDummyTx() {
		const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, 'latest');

		const dummyTx = await this.wallet.signTransaction({
			to: this.wallet.address,
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
		const nonce = await this.jsonRpcProvider.getTransactionCount(this.wallet.address, 'latest');

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

	async doMintTxOnPrivate() {
		console.log('Mint with private BlockNumber');

		const signedTx = await this.getSignedMintTx();

		await this.jsonRpcProvider.send("eth_sendPrivateTransaction", [{ tx: signedTx, preferences: { fast: true } }]);

		this.pendingTxHash = ethers.keccak256(signedTx);
	}

	async doMintTxOnFlashbots(signedTx, blockNumber) {
		const flashbotsRpcs = [
			// 'https://rpc.flashbots.net/fast?hint=hash&blockRange=' + this.FlashbotsMintingInXBlock,
			'https://rpc.mevblocker.io/',
			'https://rpc.payload.de/',
			'https://rpc.titanbuilder.xyz/',
			'https://builder0x69.io/',
			'https://rpc.beaverbuild.org/',
		];

		if (this.useFlashbots == true) {
			console.log('');
			console.log('Flashbots minting at block ' + (blockNumber + this.FlashbotsMintingInXBlock));
		}

		await Promise.allSettled(flashbotsRpcs.map(async (rpcUrl) => {
			try {
				let bundledTx;
				let dummyTx;

				bundledTx = [signedTx];

				if (rpcUrl.includes('rpc.mevblocker.io')) {
					dummyTx = await this.getSignedDummyTx();
					bundledTx = [signedTx, dummyTx];
				}

				const body = {
					jsonrpc: '2.0',
					id: 1,
					method: 'eth_sendBundle',
					params: [
						{
							txs: bundledTx,
							blockNumber: `0x${(blockNumber + this.FlashbotsMintingInXBlock).toString(16)}`,
							minTimestamp: 0,
							maxTimestamp: 0,
							revertingTxHashes: [],
							droppingTxHashes: [],
							uuid: randomUUID(),
							refundPercent: 0
						},
					],
				};

				const messageToSign = JSON.stringify(body.params[0], null, 0);
				const signature = await this.authSigner.signMessage(messageToSign);

				const header = {
					'Content-Type': 'application/json',
					'X-Flashbots-Signature': `${this.authSigner.address}:${signature}`,
				}

				const res = await axios.post(rpcUrl, body, {
					headers: header
				});

				const result = res.data?.result?.bundleHash || JSON.stringify(res.data || {});

				console.log(`📦 Bundle submitted to ${rpcUrl}: ${result}`);
			} catch (err) {
				console.warn(`❌ Error submitting to ${rpcUrl}:`, err.response?.data || err.message);
			}
		}));

		console.log(``);
	}


	async getNNBMintable() {
		const lastMintingBlock = await this.nContract.lastMintingBlock();
		const epoch = await this.nContract.epoch();
		const latestBlock = await this.jsonRpcProvider.getBlockNumber();

		const blocksSince = latestBlock - Number(lastMintingBlock);
		const required = 2 ** Number(epoch);

		return blocksSince >= required ? (blocksSince / required) + (this.useFlashbots ? this.FlashbotsMintingInXBlock : 0) : (this.useFlashbots ? this.FlashbotsMintingInXBlock : 0);
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
}

const instance = new NMintFast();
instance.init();


