const alchemyModule = await import('alchemy-sdk');
const ethersModule = await import('@ethersproject/providers');
import { ethers, Wallet, Contract, JsonRpcProvider } from 'ethers';
const axiosModule = await import('axios');
const cheerio = await import('cheerio');
const axios = axiosModule.default; 
const { Alchemy, Network, AlchemySubscription } = alchemyModule;
// UNCOMMENT TO TEST LOCAL

/*
import dotenv from 'dotenv';
dotenv.config();
*/

export class NMint {
	web3Provider;
	settings;
	alchemy;
	wallet; 
	nContract; 	
	
	walletPrivateKey = walletPrivateKey; // An ETH private key is required to proceed to this script
	rpcProviderUrl = quicknodeRpc; // QUICKNODE RPC Endpoint = recommended: flashbot and MEV bot protect add-ons must be activated
	alchemyApiKey = alchemyApiKey; // We using two endpoint for webhook and tx to enhance performance and reduce tx listing potential 
	etherscanAPIKey = etherscanApiKey;
	targetMarketPriceFactor = targetMarketPriceFactor;
	targetLimitPrice = targetLimitPrice;
	targetMaxPrice = 0.01; // Default target buy price 	
	runType = "LOCAL";
	scriptRun = true;
	 	
	contractABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_spender", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "epoch", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "lastMintingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextDoublingBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_from", "type": "address" }, { "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]; // N Contract ABI from Etherscan

	contractAddress = "0xE73d53e3a982ab2750A0b76F9012e18B256Cc243"; // N contract address.
	
	estGas = 0;
	estGasPrice = 0;
	gwei = 0;
	mintCost = 0;
	estGasPrice = 0;
	totGas = 0;
	globalSetDone = false;  // Ensure globals has been set at least once 
	feeData;
	priorityFee;
	isMintTx = false; // Used to ensure that we will not do 2 tx at same timeframe on the actual script
	lastEthUsdPrice = 2600;
	ethUsdPrice = 2600;
	addTipsGwei = '3'; // Tips per tx, higher tips does increase chance to get mined fast (But cost a bit more)

	previousMintNbMin = 0;
	timestampLastTx = new Date(Date.now() - 1000 * (this.previousMintNbMin * 60));
	wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

	poolAddress = '0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2';
	poolABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "Collect", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "CollectProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid1", "type": "uint256" }], "name": "Flash", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextOld", "type": "uint16" }, { "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextNew", "type": "uint16" }], "name": "IncreaseObservationCardinalityNext", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Initialize", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "feeProtocol0Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol0New", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1New", "type": "uint8" }], "name": "SetFeeProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Swap", "type": "event" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collect", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collectProtocol", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal0X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal1X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "flash", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }], "name": "increaseObservationCardinalityNext", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "liquidity", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxLiquidityPerTick", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "observations", "outputs": [{ "internalType": "uint32", "name": "blockTimestamp", "type": "uint32" }, { "internalType": "int56", "name": "tickCumulative", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityCumulativeX128", "type": "uint160" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32[]", "name": "secondsAgos", "type": "uint32[]" }], "name": "observe", "outputs": [{ "internalType": "int56[]", "name": "tickCumulatives", "type": "int56[]" }, { "internalType": "uint160[]", "name": "secondsPerLiquidityCumulativeX128s", "type": "uint160[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "positions", "outputs": [{ "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" }, { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" }, { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "protocolFees", "outputs": [{ "internalType": "uint128", "name": "token0", "type": "uint128" }, { "internalType": "uint128", "name": "token1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "feeProtocol0", "type": "uint8" }, { "internalType": "uint8", "name": "feeProtocol1", "type": "uint8" }], "name": "setFeeProtocol", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slot0", "outputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "internalType": "int24", "name": "tick", "type": "int24" }, { "internalType": "uint16", "name": "observationIndex", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }, { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" }, { "internalType": "bool", "name": "unlocked", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }], "name": "snapshotCumulativesInside", "outputs": [{ "internalType": "int56", "name": "tickCumulativeInside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityInsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsInside", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "bool", "name": "zeroForOne", "type": "bool" }, { "internalType": "int256", "name": "amountSpecified", "type": "int256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [{ "internalType": "int256", "name": "amount0", "type": "int256" }, { "internalType": "int256", "name": "amount1", "type": "int256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "int16", "name": "", "type": "int16" }], "name": "tickBitmap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tickSpacing", "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "name": "ticks", "outputs": [{ "internalType": "uint128", "name": "liquidityGross", "type": "uint128" }, { "internalType": "int128", "name": "liquidityNet", "type": "int128" }, { "internalType": "uint256", "name": "feeGrowthOutside0X128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthOutside1X128", "type": "uint256" }, { "internalType": "int56", "name": "tickCumulativeOutside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityOutsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsOutside", "type": "uint32" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];
	nUsdUniswapV3Price;
	fetch;
	sumMintN = 0;
	sumMintNPrice = 0;

    constructor() 
	{
	}

	async runScript(pk, ak, ek, rpc, tgMarketPriceFactor, tgLimitPrice, rpcPace) {	
	    this.walletPrivateKey = pk;
	    this.alchemyApiKey = ak;
	    this.etherscanAPIKey = ek;
	    this.rpcProviderUrl = rpc;
	    this.targetMarketPriceFactor = tgMarketPriceFactor;
	    this.targetLimitPrice = tgLimitPrice;
		this.rpcPace = rpcPace;
		
		try {
	    this.initWeb3();  
		this.mintToken();
		} catch (ex){
			console.log("Line 91 " + ex);
		}
	}
	
	async stopScript() {
	    this.scriptRun = false;
	}
	
	async fetchTransactionFee(txHash) {
		const url = `https://etherscan.io/tx/${txHash}`;
		
		try {
			// Fetch the transaction page
			const response = await axios.get(url);
			const data = response.data;
			
			// Load the HTML into cheerio
			const $ = cheerio.load(data);
	
			// Extract the transaction fee
			// This assumes the transaction fee is within a <td> with specific text
			const txnFee = $('#ContentPlaceHolder1_spanTxFee > div > span:nth-child(2)').text().replace('($','').replace(')','');
	
			// console.log(`Transaction Fee for ${txHash}: ${txnFee}`);
	
			return txnFee;
		} catch (ex) {
				console.log("Line 118 " + ex);
				console.error('Error fetching transaction fee:', ex.message);
			
		}
	}

	async fetchTransactionSuccess(txHash) {
		const url = `https://etherscan.io/tx/${txHash}`;
		
		try {
			// Fetch the transaction page
			const response = await axios.get(url);
			const data = response.data;
			
			// Load the HTML into cheerio
			const $ = cheerio.load(data);

			const txSuccess = $("~:contains('Success')").first()
			console.log('Success ');
			console.log(txSuccess.text());
			
			if(txSuccess)
				return true;
			else 
				return false;
	
		} catch (ex) {
				console.log("Line 118 " + ex);
				console.error('Error fetching tx success:', ex.message);
			
		}
	}	

	calculateTransactionCostTx(tx) {
		console.log(tx.transaction.hash)
		this.web3Provider.getTransactionReceipt(tx.transaction.hash, (err, txReceipt) => {
			if (err) {
			  console.error('Error getting transaction receipt:', err);
			} else {
			  const gasUsed = txReceipt.gasUsed;
		  
			  this.web3Provider.getTransaction(txHash, (err, tx) => {
				if (err) {
				  console.error('Error getting transaction:', err);
				} else {
				  const gasPrice = tx.gasPrice;
				  const transactionFee = gasUsed * gasPrice;
		  
				  console.log('Transaction Fee in Wei:', transactionFee);
				  console.log('Transaction Fee in ETH:', this.web3Provider.fromWei(transactionFee.toString(), 'ether'));
				  var usd = this.web3Provider.fromWei(transactionFee.toString(), 'ether') * this.ethUsdPrice;
				  console.log('Transaction Fee in USD:', usd);

				  return usd
				}
			  });
			}
		  });
	}
	calculateTransactionCostData(gas, gasPrice, gasPriorityFee) {
		const txGas = parseInt(gas, 16);
		const txGasPrice = parseInt(gasPrice, 16);
		const priorityFee = parseInt(gasPriorityFee, 16);
		const gweiToEth = 1e-9;

		const transactionCostEth = txGas *  ethers.formatUnits(txGasPrice, 'gwei') * gweiToEth;
		const transactionCostUsd = transactionCostEth * this.ethUsdPrice;

		return transactionCostUsd;
	}
	initWeb3(){
		this.web3Provider = new JsonRpcProvider(this.rpcProviderUrl);
		this.settings = {
		    apiKey: this.alchemyApiKey,
		    network: Network.ETH_MAINNET,
		};
		this.alchemy = new Alchemy(this.settings);
		this.alchemy.ws.on(
		  {
		    method: AlchemySubscription.MINED_TRANSACTIONS,
		    addresses: [
		      {
		        to: this.contractAddress,
		      },
		    ],
		    includeRemoved: true,
		    hashesOnly: false,
		  },
		  
		  async (tx) => {
			try {
				this.timestampLastTx = Date.now();

				// Log trace last mined tx results

				var fethedGasFees = await this.fetchTransactionFee(tx.transaction.hash);	
				var fetchTransactionSuccess = await this.fetchTransactionSuccess(tx.transaction.hash);	
				console.log('fetchTransactionSuccess '+ fetchTransactionSuccess);

				if(tx.transaction.from.toLowerCase() == this.wallet.address.toLowerCase()) {
					this.sumMintN += this.nbMintableBeforeCallFromMyWallet;

					this.sumMintPrice += fethedGasFees;

					console.log('** SUMMARY: N minted = ' + this.sumMintN + ', txPrice = ' + this.mintCost + ', Total Mint Cost = ' + this.sumMintPrice + ', AVG $/N = ' + (this.sumMintPrice/this.sumMintN) + ' **');
					// + ' Mint total cost = ' + this.sumMintPrice + ', Mint cost/N = ' + (this.sumMintPrice/this.sumMintN) + ' **');
					


					setTimeout(async () => {
						var nbNInCommunityWallet = await this.nContract.balanceOf(this.wallet.address);
						console.log('');
						console.log('NB N in community Wallet ' + this.wallet.address + ' = ' + ethers.formatUnits(nbNInCommunityWallet, 'ether') );
						console.log('');
					},7000);

				} else {
					console.log("** N Contract MINT succeed: " + new Date().toLocaleTimeString() + " From: " + tx.transaction.from + " Minted: " + this.nbMintableBeforeZero + " maxFeePerGas: " + this.hexToGwei(tx.transaction.maxFeePerGas) + " maxPriorityFeePerGas: " + this.hexToGwei(tx.transaction.maxPriorityFeePerGas) + " Mint cost: " + this.mintCost + "$ **"); 
					console.log('');
				}


			} catch(ex) {
				console.log("Line 204 " + ex);
			}
		  }
		); // Listen any kind of tx call on the contract. It's a lazy way to check that any kind of tx is run on the contract		

		this.wallet = new Wallet(this.walletPrivateKey, this.web3Provider); // Investore wallet init on web3 RPC
		this.nContract = new Contract(this.contractAddress, this.contractABI, this.wallet); // Contract with investor wallet init 
	}
	
	// It's the simplest mint orchestrator that could be done: refresh global var each 20 sec + check if we should try a mint each 11 sec
	async mintToken() {
	    this.fetch = (await import('node-fetch')).default;
	
	    // Take last contract tx as the last call to mint... might not be a mint, it's a safety net
	    this.timestampLastTx = await this.getLastTransactionTime(this.contractAddress, this.etherscanAPIKey);

	    await this.setGlobal();
	    setInterval(async () => { await  this.setGlobal() }, (120 *1000)); // Ensure to update global periodicly to reduce nb op on RPC
	    this.mintTokenNow();
	    // setInterval(async () => { await  this.mintTokenNow() }, (900)); // Validate each X time if we should mint per actual targets

		this.scheduleNextMintChech();
	}
	
	async scheduleNextMintChech(){
		var tm = this.generateRandomBetween(Number(rpcPace), (Number(rpcPace) + 20));
		setTimeout(async () => { await  this.mintTokenNow() }, (tm));
		//console.log('next schedule mint check ' + tm);
	}

	// FROM N/WETH Uniswap pool
	async getNUsdPrice() {
	    const poolContract = new Contract(this.poolAddress, this.poolABI, this.web3Provider);
	    
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
	
	async getLastTransactionTime(contractAddress, apiKey) {
	    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
	
	    try {
	        const response = await axios.get(url);
	        if (response.data.status === "1" && response.data.result.length > 0) {
	            const lastTransaction = response.data.result[0];
	            return new Date(lastTransaction.timeStamp * 1000);
	        } else {
	            return Date.now();
	        }
	    } catch (ex) {
			console.log("Line 259 " + ex);
	        return Date.now()
	    }
	}
	
	async setGlobal(){
	    try {
	        this.feeData = await this.web3Provider.getFeeData();
	        this.maxPriorityFeePerGas = this.feeData.maxPriorityFeePerGas;
	        this.priorityFee = ethers.parseUnits(this.addTipsGwei, 'gwei');
	        this.priorityFeePerGas = this.maxPriorityFeePerGas + this.priorityFee;
	        this.gasPrice = this.feeData.gasPrice;
	        this.gwei = parseFloat(ethers.formatUnits(this.estGas, 'gwei'));
	        this.ethUsdPrice = await this.getEthUsdPrice(); 
	        this.estGasPrice = await this.getGasPriceEthersJs();
	        this.defaultGasLimit = this.estGas * 2;
	        this.nUsdUniswapV3Price = await this.getNUsdPrice();
	        this.targetMaxPrice = this.nUsdUniswapV3Price * this.targetMarketPriceFactor; // Target buy price
	        this.globalSetDone = true; // Ensure globals has been set at least once before trying a mint


			try {
				this.mintGas = await this.estimateGas();
				// console.log('estimateGas for minting ' + Number(this.mintGas));
			} catch(ex) {
				this.mintGas = BigInt(61000);
				console.log("Line 273 " + ex);
				console.log('Use last mintcost as estimateGas = not able to return a value');
			}
			if(this.mintGas != NaN)
				this.mintGas = BigInt(61000);

	        this.mintCost = (Number(ethers.formatUnits(Number(this.mintGas) * Number(this.estGasPrice), 'gwei')) * Number(this.ethUsdPrice))/ 1000000000; // Cost of a mint in USD

		} catch (ex) {
			console.log("Line 291 " + ex);
			console.log(ex);
	    }
	} 

	mintCount = 0; // Used to set some sort of variation on the mint price to try defeating the mint bots

	generateRandomBetween(min, max) {
	    return Math.random() * (max - min) + min;
	}

	convertBigInt(num){
		const bigIntValue = BigInt(num);

		if (bigIntValue <= BigInt(Number.MAX_SAFE_INTEGER) && bigIntValue >= BigInt(Number.MIN_SAFE_INTEGER)) {
			return Number(bigIntValue);
		} else {
			console.log("BigInt value is too large to be safely converted to a Number!");
			return bigIntValue;
		}		
	}

	async getNNBMintable_bkp(){
		this.totalSupply = Number(BigInt(await this.nContract.totalSupply())/ BigInt(1e18));

		var epoch = await this.nContract.epoch();
		//var nbNInCommunityBot1 = await this.nContract.balanceOf('0x82A53178e7A7e454ab31eEA6063FdcA338418F74');
		//var nbNInCommunityBot2 = await this.nContract.balanceOf('0xA22F1AC02b5Fc04f2E355c30AEBFd82a7465b250');
		// var nbNInCommunityBlaze = await this.nContract.balanceOf('0x3E9A90A272A5ED280F7933664b93Db2B6b09866F');


		//console.log('NB N in bot1 Wallet 0x82A53178e7A7e454ab31eEA6063FdcA338418F74 = ' + ethers.formatUnits(nbNInCommunityBot1, 'ether') );
		//console.log('NB N in bot2 Wallet 0xA22F1AC02b5Fc04f2E355c30AEBFd82a7465b250 = ' + ethers.formatUnits(nbNInCommunityBot2, 'ether') );
		// console.log('NB N in blaze Wallet 0x3E9A90A272A5ED280F7933664b93Db2B6b09866F = ' + ethers.formatUnits(nbNInCommunityBlaze, 'ether') );

		var lastMintingBlock = await this.nContract.lastMintingBlock();
		var latestEthBlock = await this.web3Provider.getBlock("latest");
		var latestEthBlockNumber = Number(latestEthBlock.number);
		var blocksBetweenMints = Number(BigInt(latestEthBlockNumber) - BigInt(lastMintingBlock));
		
		var nbMintable = 0;

		if (blocksBetweenMints >= this.convertBigInt(2**Number(epoch))) {
			nbMintable = (blocksBetweenMints/(2**Number(epoch)));
		}

		if(this.nbMintableBeforeZero == undefined || this.nbMintableBeforeZero == 0 || this.nbMintableBeforeZero == NaN)
			this.nbMintableBeforeZero = nbMintable;

		if(nbMintable==0) {
			this.nbMintableBeforeZero = this.nbMintableBeforeCallFromMyWallet;
		}

		return nbMintable;
	}

	async getNNBMintable() {
		const lastMintingBlock = await this.nContract.lastMintingBlock();
		const epoch  = await this.nContract.epoch();
		const latestEthBlock = await this.web3Provider.getBlock("latest");
		const blockNumber = Number(latestEthBlock.number);
		const blocksBetweenMints = Number(BigInt(blockNumber) - BigInt(lastMintingBlock));

	
		if (Number(blocksBetweenMints) >= 2 ** Number(epoch)) {
			const numberToMint = Number(blocksBetweenMints)/ (2 ** Number(epoch));
			// console.log('Mintable ' + numberToMint);
			return numberToMint;
		} else {
			return 0;
		}
	}

	async mintTokenNow() {
		this.scheduleNextMintChech();

		if(this.isMintTx == false && this.globalSetDone == true && this.scriptRun == true) {
	        try {
			   this.nbMintableBeforeCallFromMyWallet = await this.getNNBMintable();
		       var pricePerN = (this.mintCost/this.nbMintableBeforeCallFromMyWallet);
	           var actualPricePerNTarget = this.targetMaxPrice;
			   
	           if(this.mintCount != 0 ) {
	                actualPricePerNTarget = this.targetMaxPrice + this.generateRandomBetween(-0.02, 0.02);
	           }

	           //var sec = this.secondsDifferenceFromNow(this.timestampLastTx);
			   //console.log("");
			   //console.log("TARGET $/N: " + actualPricePerNTarget + ", Actual $/N : " + pricePerN + " NB Mintable : " + this.nbMintableBeforeCallFromMyWallet + ' Mint cost $: ' + this.mintCost);
			   //console.log("");

	           if(pricePerN <= actualPricePerNTarget && pricePerN <= this.targetLimitPrice && this.isMintTx == false){
	                this.mintCount = (this.mintCount ==2 ? 0: this.mintCount+1);
					console.log('');
	                console.log('TARGET REACH - Mint tx init : Mintable N: ' + this.nbMintableBeforeCallFromMyWallet + ' Estimated $/N: ' + pricePerN + ' Mint cost $: ' + this.mintCost);
					await this.mintTokenOp();
	           }

	        } catch (ex) {
				console.log("Line 404 " + ex);
	        }
	    }
	}


	async mintTokenOp() {
	    if(this.isMintTx == false) {
			this.isMintTx = true;
			// Force wait 3 minutes before next trial

			var tm = this.generateRandomBetween(25000, 55000);

			setTimeout( async() => {
				this.isMintTx = false; 
			}, (tm));
	

	        try {
	                var currentNonce = await this.web3Provider.getTransactionCount(this.wallet.address, "latest");

	                if(this.minutesDifferenceFromNow(this.timestampLastTx) > 0){

	                    const signedTransaction = await this.wallet.signTransaction({
	                        to: this.contractAddress,
	                        data: this.nContract.interface.encodeFunctionData("mint"),
							nonce: currentNonce++,
	                        gasLimit: this.mintGas , // Default logical limit
	                        maxPriorityFeePerGas: (this.feeData.maxPriorityFeePerGas * BigInt(150)) / BigInt(100),
	                        maxFeePerGas:  (this.feeData.gasPrice * BigInt(150)) / BigInt(100), // Increased by 30% to encourage miners to pick tx fast
	                        type: 2,
	                        chainId: 1
	                    });

	                    const heads = await this.web3Provider.send("eth_sendPrivateTransaction", [
	                    {
	                      "tx": signedTransaction,
	                      "preferences": {
	                        "fast": true,
	                      }
	                    },
	                    ]);
	                    
	                    // console.log("Contract mint function called from your wallet at " + new Date().toLocaleTimeString() + " Transaction mined: ", heads);
	                }
	        } catch (ex) {
				console.log("Line 414 " + ex);
	            //sthis.isMintTx = false;
	        }
	    }
	}

	hexToGwei(hexValue) {
	    try {
	        const decimalValue = BigInt(hexValue);
	        const weiToGwei = BigInt("1000000000");
	        const gweiValue = decimalValue / weiToGwei;
	
	        return gweiValue.toString();
	    } catch(ex) {
			console.log("Line  " + ex);
	        return 0;
	    }
	}

	async estimateGas() {
	    try {
	        const transaction = {
	            to: this.contractAddress,
	            data: this.nContract.interface.encodeFunctionData("mint")
	        };
	
	        var estimGas = await this.web3Provider.estimateGas(transaction);

	        return estimGas;
	    } catch (ex) {
			return BigInt(61043); // Default usual value 
	    }
	}

	async getGasPriceEthersJs() {
	    try {
	        const gasPrice = this.feeData.gasPrice;
	        return gasPrice;
	    } catch (ex) {
			console.log("Line 453 " + ex);
	        console.error('Failed to get gas price from ethers.js, falling back to Etherscan:', ex.message);
	        return null;
	    }
	}

	minutesDifferenceFromNow(dateToCompare) {
	    const now = new Date();
	    const differenceInMilliseconds = now - dateToCompare;
	    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
	    
	    return differenceInMinutes;
	}

	
	secondsDifferenceFromNow(dateToCompare) {
	    const now = new Date();
	    const differenceInMilliseconds = now - dateToCompare;
	    const differenceInMinutes = differenceInMilliseconds / (1000);
	    
	    return differenceInMinutes;
	}

	async checkEthBalanceInUsd() {
	    const balance = await this.web3Provider.getBalance(this.wallet.address);
	    const balanceInEth = ethers.formatEther(balance);
	    const ethUsdPrice = await this.getEthUsdPrice();
	    const balanceInUsd = (parseFloat(balanceInEth) * ethUsdPrice).toFixed(2);
	
	    return balanceInUsd;
	}

	async getEthUsdPrice() {
		const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
	
		try {
			const response = await axios.get(url);
			const data = response.data;
			// console.log('Ethereum USD Price: ' + data.ethereum.usd);
			return data.ethereum.usd;
		} catch (ex) {
			console.log("Line 494 " + ex);
			// console.error('Failed to fetch Ethereum price:', error);
			return this.ethUsdPrice;  // Assumes there is a fallback or default value set elsewhere in your class
		}
	}
}

// UNCOMMENT TO TEST LOCAL

/*

const walletPrivateKey = process.env.PRIVATE_KEY;
const quicknodeRpc = process.env.QUICKNODE_RPC;
const alchemyApiKey = process.env.ALCHEMY_KEY;
const etherscanApiKey = process.env.ETHERSCAN_KEY;
const targetMarketPriceFactor = process.env.TG_MARKET_PRICE;
const targetLimitPrice = process.env.TG_LIMIT_PRICE;
const rpcPace = process.env.RPC_PACE;

export {
    walletPrivateKey,
    quicknodeRpc,
    alchemyApiKey,
    etherscanApiKey,
    targetMarketPriceFactor,
    targetLimitPrice,
	rpcPace
};

var $script = new NMint();

$script.initWeb3();
try {
	$script.mintToken();
} catch(ex) {
	console.log("Line 507 " + ex);
}
*/