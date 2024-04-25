/* NOTES ABOUT MAIN SCRIPT PARAMETERS 
    ** Note: If all users of this minter script set the same target price using the above parameter,
       there's a high likelihood of missing mint targets. Setting a target of 50%+ of the actual market price is currently a good strategy to succeed. **
 */

/* TODO / ENHANCEMENTS
    - Enhance the accuracy of N mint cost evaluation.
    - Add spending limits; currently, the script will continue to mint until there are no more ETH funds or the user terminates the process.
    - Improve API and websocket management
    - Optimize code for better performance and maintainability.
*/
const alchemyModule = await import('alchemy-sdk');
const ethersModule = await import('@ethersproject/providers');
import { ethers, Wallet, Contract, JsonRpcProvider } from 'ethers';
const axiosModule = await import('axios');
const axios = axiosModule.default;  // Assuming axios uses default export
const { Alchemy, Network, AlchemySubscription } = alchemyModule;
	
export class NMint {
	web3Provider;
	settings;
	alchemy;
	wallet; 
	nContract; 	
	
	walletPrivateKey; // An ETH private key is required to proceed to this script
	rpcProviderUrl; // QUICKNODE RPC Endpoint = recommended: flashbot and MEV bot protect add-ons must be activated
	alchemyApiKey; // We using two endpoint for webhook and tx to enhance performance and reduce tx listing potential 
	etherscanAPIKey;
	targetMarketPriceFactor = 0.65; 	
	 	
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
	lastEthUsdPrice = 3200;
	ethUsdPrice = 3200;
	addTipsGwei = '3'; // Tips per tx, higher tips does increase chance to get mined fast (But cost a bit more)
	targetMaxPrice = 0.01; // Default target buy price
	previousMintNbMin = 3;
	timestampLastTx = new Date(Date.now() - 1000 * (this.previousMintNbMin * 60));
	wethAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
	poolAddress = '0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2';
	poolABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "Collect", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "indexed": false, "internalType": "uint128", "name": "amount1", "type": "uint128" }], "name": "CollectProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "paid1", "type": "uint256" }], "name": "Flash", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextOld", "type": "uint16" }, { "indexed": false, "internalType": "uint16", "name": "observationCardinalityNextNew", "type": "uint16" }], "name": "IncreaseObservationCardinalityNext", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Initialize", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "int24", "name": "tickLower", "type": "int24" }, { "indexed": true, "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "indexed": false, "internalType": "uint128", "name": "amount", "type": "uint128" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "feeProtocol0Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1Old", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol0New", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "feeProtocol1New", "type": "uint8" }], "name": "SetFeeProtocol", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "int256", "name": "amount0", "type": "int256" }, { "indexed": false, "internalType": "int256", "name": "amount1", "type": "int256" }, { "indexed": false, "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "indexed": false, "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "indexed": false, "internalType": "int24", "name": "tick", "type": "int24" }], "name": "Swap", "type": "event" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collect", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint128", "name": "amount0Requested", "type": "uint128" }, { "internalType": "uint128", "name": "amount1Requested", "type": "uint128" }], "name": "collectProtocol", "outputs": [{ "internalType": "uint128", "name": "amount0", "type": "uint128" }, { "internalType": "uint128", "name": "amount1", "type": "uint128" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint24", "name": "", "type": "uint24" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal0X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeGrowthGlobal1X128", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "flash", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }], "name": "increaseObservationCardinalityNext", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "liquidity", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxLiquidityPerTick", "outputs": [{ "internalType": "uint128", "name": "", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint128", "name": "amount", "type": "uint128" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "observations", "outputs": [{ "internalType": "uint32", "name": "blockTimestamp", "type": "uint32" }, { "internalType": "int56", "name": "tickCumulative", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityCumulativeX128", "type": "uint160" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint32[]", "name": "secondsAgos", "type": "uint32[]" }], "name": "observe", "outputs": [{ "internalType": "int56[]", "name": "tickCumulatives", "type": "int56[]" }, { "internalType": "uint160[]", "name": "secondsPerLiquidityCumulativeX128s", "type": "uint160[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "positions", "outputs": [{ "internalType": "uint128", "name": "liquidity", "type": "uint128" }, { "internalType": "uint256", "name": "feeGrowthInside0LastX128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthInside1LastX128", "type": "uint256" }, { "internalType": "uint128", "name": "tokensOwed0", "type": "uint128" }, { "internalType": "uint128", "name": "tokensOwed1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "protocolFees", "outputs": [{ "internalType": "uint128", "name": "token0", "type": "uint128" }, { "internalType": "uint128", "name": "token1", "type": "uint128" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "feeProtocol0", "type": "uint8" }, { "internalType": "uint8", "name": "feeProtocol1", "type": "uint8" }], "name": "setFeeProtocol", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slot0", "outputs": [{ "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" }, { "internalType": "int24", "name": "tick", "type": "int24" }, { "internalType": "uint16", "name": "observationIndex", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" }, { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" }, { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" }, { "internalType": "bool", "name": "unlocked", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }], "name": "snapshotCumulativesInside", "outputs": [{ "internalType": "int56", "name": "tickCumulativeInside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityInsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsInside", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "bool", "name": "zeroForOne", "type": "bool" }, { "internalType": "int256", "name": "amountSpecified", "type": "int256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [{ "internalType": "int256", "name": "amount0", "type": "int256" }, { "internalType": "int256", "name": "amount1", "type": "int256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "int16", "name": "", "type": "int16" }], "name": "tickBitmap", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "tickSpacing", "outputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "int24", "name": "", "type": "int24" }], "name": "ticks", "outputs": [{ "internalType": "uint128", "name": "liquidityGross", "type": "uint128" }, { "internalType": "int128", "name": "liquidityNet", "type": "int128" }, { "internalType": "uint256", "name": "feeGrowthOutside0X128", "type": "uint256" }, { "internalType": "uint256", "name": "feeGrowthOutside1X128", "type": "uint256" }, { "internalType": "int56", "name": "tickCumulativeOutside", "type": "int56" }, { "internalType": "uint160", "name": "secondsPerLiquidityOutsideX128", "type": "uint160" }, { "internalType": "uint32", "name": "secondsOutside", "type": "uint32" }, { "internalType": "bool", "name": "initialized", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }];
	nUsdUniswapV3Price;
	fetch;
	 
    constructor()
	{
	}
    
	async runScript(pk, ak, ek, rpc) {	
	    this.walletPrivateKey = pk;
	    this.alchemyApiKey = ak;
	    this.etherscanAPIKey = ek;
	    this.rpcProviderUrl = rpc;
	    
	    this.initWeb3();  
	    this.scriptRun = true;
		this.mintToken().catch(console.error);
	}
	
	async stopScript() {
	    this.scriptRun = false;
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
		  
		  (tx) => {
		    var nbMinPrevious = this.minutesDifferenceFromNow(this.timestampLastTx);
		    var nbMintable = ((nbMinPrevious * 60) / 12) + 2; // (NB MIN * 60 secondes) / 12 seconds as 1 N is mintable per this period + 2 as a general buffer
		    var pricePerN = (this.mintCost / nbMintable);
		
		    // Log trace last mined tx results
		    console.log("" + new Date().toLocaleTimeString() + " From: " + tx.transaction.from + " Minted: " + nbMintable + " maxFeePerGas: " + this.hexToGwei(tx.transaction.maxFeePerGas) + " maxPriorityFeePerGas: " + this.hexToGwei(tx.transaction.maxPriorityFeePerGas) + " Mint cost: " + pricePerN + "$"); 
		    this.timestampLastTx = Date.now();
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
	    setInterval(async () => { await  this.setGlobal() }, (20 *1000)); // Ensure to update global periodicly to reduce nb op on RPC
	    this.mintTokenNow();
	    setInterval(async () => { await  this.mintTokenNow() }, (11000)); // Validate each X time if we should mint per actual targets
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
	    } catch (error) {
	        return Date.now()
	    }
	}
	
	async setGlobal(){
	    try {
	        this.feeData = await this.web3Provider.getFeeData();
	        this.nUsdUniswapV3Price = await this.getNUsdPrice();
	        this.targetMaxPrice = this.nUsdUniswapV3Price * this.targetMarketPriceFactor; // Target buy price
	        this.maxPriorityFeePerGas = this.feeData.maxPriorityFeePerGas;
	        this.priorityFee = ethers.parseUnits(this.addTipsGwei, 'gwei');
	        this.priorityFeePerGas = this.maxPriorityFeePerGas + this.priorityFee;
	        this.gasPrice = this.feeData.gasPrice;
	        this.estGas = Number(await this.estimateGas());
	        this.gwei = parseFloat(ethers.formatUnits(this.estGas, 'gwei'));
	
	        this.ethUsdPrice = await this.getEthUsdPrice(); 
	        this.estGasPrice = await this.getGasPriceEthersJs();
	        this.totGas = this.estGas * ethers.formatUnits(this.estGasPrice, 'gwei') / 1000000000;
	        this.mintCost = this.totGas * this.ethUsdPrice; // Cost of a mint in USD
	        this.defaultGasLimit = this.estGas * 2;
	        this.globalSetDone = true; // Ensure globals has been set at least once before trying a mint
	    } catch (ex) {
			console.log(ex);
	    }
	} 

	mintCount = 0; // Used to set some sort of variation on the mint price to try defeating the mint bots

	generateRandomBetween(min, max) {
	    return Math.random() * (max - min) + min;
	}

	async mintTokenNow() {
	    if(this.isMintTx == false && this.globalSetDone == true && this.scriptRun == true) {
	        try {
	           var nbMinPrevious = this.minutesDifferenceFromNow(this.timestampLastTx);
	           var nbMintable = ((nbMinPrevious * 60 )/12) + 2;
	           var pricePerN = (this.mintCost/nbMintable);
	           
	           var actualPricePerNTarget = this.targetMaxPrice;
			   
	           if(this.mintCount != 0 ) {
	                actualPricePerNTarget = this.targetMaxPrice + this.generateRandomBetween(-0.002, 0.002);
	           }
	           
	           console.log("target : " + actualPricePerNTarget + ", Actual estimated cost per N : " + pricePerN);
	           if(pricePerN < actualPricePerNTarget){
	                this.mintCount = (this.mintCount ==2 ? 0: this.mintCount+1);
	
	                console.log('' + new Date().toLocaleTimeString() + ' Gaz gwei ' + this.gwei + ' : Min since last TX: ' +  nbMinPrevious + '  Mintable N: ' + nbMintable + ' Estimated $/N: ' + pricePerN + ' Total est. mint $: ' + this.mintCost);
	                await this.mintTokenOp();
	           }
	        } catch (ex) {
	            console.log(ex);
	        }
	    }
	}

	async mintTokenOp() {
	    if(this.isMintTx == false) {
	        this.isMintTx = true;
	
	        try {
	                var currentNonce = await this.web3Provider.getTransactionCount(this.wallet.address, "latest");
	            
	                if(this.minutesDifferenceFromNow(this.timestampLastTx) > 1){
	                    const signedTransaction = await this.wallet.signTransaction({
	                        to: this.contractAddress,
	                        data: this.nContract.interface.encodeFunctionData("mint"),
	                        nonce: currentNonce++,
	                        gasLimit: 100000, // Default logical limit
	                        maxPriorityFeePerGas: this.feeData.maxPriorityFeePerGas + this.priorityFee,
	                        maxFeePerGas: (this.feeData.gasPrice * BigInt(120)) / BigInt(100), // Increased by 20% to encourage miners to pick tx fast
	                        type: 2,
	                        chainId: 1
	                    });    
	                    
	                    // Send the tx throught Quicknode (Should have activate the Flashbot + MEV protect add-on)
	                    const heads = await this.web3Provider.send("eth_sendPrivateTransaction", [
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
	                        this.isMintTx = false; 
	                        this.timestampLastTx = Date.now();
	                    }, (((3)  * 60 )*1000));
	                }
	        } catch (ex) {
	            console.log(ex);
	            this.isMintTx = false;
	        }
	    }
	}

	hexToGwei(hexValue) {
	    try {
	        const decimalValue = BigInt(hexValue);
	        const weiToGwei = BigInt("1000000000");
	        const gweiValue = decimalValue / weiToGwei;
	
	        return gweiValue.toString();
	    } catch (ex){
	        return 0;
	    }
	}

	async estimateGas() {
	    try {
	        const transaction = {
	            to: this.contractAddress,
	            data: this.nContract.interface.encodeFunctionData("mint")
	        };
	
	        const estimGas = await this.web3Provider.estimateGas(transaction);
	
	        return estimGas;
	    } catch (error) {
	    }
	}

	async getGasPriceEthersJs() {
	    try {
	        const gasPrice = this.feeData.gasPrice;
	        return gasPrice;
	    } catch (error) {
	        console.error('Failed to get gas price from ethers.js, falling back to Etherscan:', error.message);
	        return null;
	    }
	}

	minutesDifferenceFromNow(dateToCompare) {
	    const now = new Date();
	    const differenceInMilliseconds = now - dateToCompare;
	    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);
	    
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
	        if (response.data.status === "1" && response.data.result.length > 0) {
	            const price = response.data.result[0].ethereum.usd;
	            return price;
	        } else {
	            return 3200;
	        }
	    } catch (error) {
			console.log(error);
	        return 3200;
	    }
	}
}