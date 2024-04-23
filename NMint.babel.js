"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var _require = require('ethers'),
  ethers = _require.ethers,
  JsonRpcProvider = _require.JsonRpcProvider,
  utils = _require.utils;
var axios = require('axios');
var _require2 = require('@ethersproject/bignumber'),
  BigNumber = _require2.BigNumber;
var _require3 = require("alchemy-sdk"),
  Alchemy = _require3.Alchemy,
  Network = _require3.Network,
  AlchemySubscription = _require3.AlchemySubscription;
var WebSocket = require('ws');
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

var scriptRun = true;
function runScript() {
  var privateKey = document.getElementById('privateKey').value;
  var alchemyKey = document.getElementById('alchemyKey').value;
  var etherscanKey = document.getElementById('etherscanKey').value;
  var quicknodeRPC = document.getElementById('quicknodeRPC').value;
  process.env.PRIVATE_KEY = privateKey;
  process.env.ETH_RPC = quicknodeRPC;
  process.env.ETHERSCAN_API_KEY = etherscanKey;
  process.env.ALCHEMY_API_KEY = alchemyKey;
  mintToken()["catch"](console.error);
}
function stopScript() {
  scriptRun = stop;
}
var walletPrivateKey = process.env.PRIVATE_KEY; // An ETH private key is required to proceed to this script

if (!walletPrivateKey) {
  console.error("Private key not found in environment variables. NOT OPTIONAL");
  process.exit(1);
}
var rpcProviderUrl = process.env.ETH_RPC || 'https://fluent-fabled-sailboat.quiknode.pro/yourendpoint/'; // QUICKNODE RPC Endpoint = recommended: flashbot and MEV bot protect add-ons must be activated
var web3Provider = new JsonRpcProvider(rpcProviderUrl);
var alchemyApiKey = process.env.ALCHEMY_API_KEY || 'youralchemykey'; // We using two endpoint for webhook and tx to enhance performance and reduce tx listing potential 

var settings = {
  apiKey: alchemyApiKey,
  network: Network.ETH_MAINNET
};
var etherscanAPIKey = process.env.ETHERSCAN_API_KEY || 'youretherscanapikey';
var targetMarketPriceFactor = process.env.TARGET_MARKET_PRICE_FACTOR || 0.56;
var alchemy = new Alchemy(settings);
var contractABI = [{
  "inputs": [],
  "stateMutability": "nonpayable",
  "type": "constructor"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "spender",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
  }],
  "name": "Approval",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "from",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "to",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
  }],
  "name": "Transfer",
  "type": "event"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }, {
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "name": "allowance",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "_spender",
    "type": "address"
  }, {
    "internalType": "uint256",
    "name": "_value",
    "type": "uint256"
  }],
  "name": "approve",
  "outputs": [{
    "internalType": "bool",
    "name": "success",
    "type": "bool"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "name": "balanceOf",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "decimals",
  "outputs": [{
    "internalType": "uint8",
    "name": "",
    "type": "uint8"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "epoch",
  "outputs": [{
    "internalType": "uint8",
    "name": "",
    "type": "uint8"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "lastDoublingBlock",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "lastMintingBlock",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "mint",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "name",
  "outputs": [{
    "internalType": "string",
    "name": "",
    "type": "string"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "nextDoublingBlock",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "symbol",
  "outputs": [{
    "internalType": "string",
    "name": "",
    "type": "string"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "totalSupply",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "_to",
    "type": "address"
  }, {
    "internalType": "uint256",
    "name": "_value",
    "type": "uint256"
  }],
  "name": "transfer",
  "outputs": [{
    "internalType": "bool",
    "name": "success",
    "type": "bool"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "_from",
    "type": "address"
  }, {
    "internalType": "address",
    "name": "_to",
    "type": "address"
  }, {
    "internalType": "uint256",
    "name": "_value",
    "type": "uint256"
  }],
  "name": "transferFrom",
  "outputs": [{
    "internalType": "bool",
    "name": "success",
    "type": "bool"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}]; // N Contract ABI from Etherscan
var contractAddress = "0xE73d53e3a982ab2750A0b76F9012e18B256Cc243"; // N contract address.
var wallet = new ethers.Wallet(walletPrivateKey, web3Provider); // Investore wallet init on web3 RPC
var nContract = new ethers.Contract(contractAddress, contractABI, wallet); // Contract with investor wallet init 
var estGas = 0;
var estGasPrice = 0;
var gwei = 0;
var mintCost = 0;
var estGasPrice = 0;
var totGas = 0;
var globalSetDone = false; // Ensure globals has been set at least once
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
var poolAddress = process.env.UNISWAP_V3_POOL || '0x90e7a93E0a6514CB0c84fC7aCC1cb5c0793352d2';
var poolABI = [{
  "inputs": [],
  "stateMutability": "nonpayable",
  "type": "constructor"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount",
    "type": "uint128"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }],
  "name": "Burn",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount0",
    "type": "uint128"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount1",
    "type": "uint128"
  }],
  "name": "Collect",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount0",
    "type": "uint128"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount1",
    "type": "uint128"
  }],
  "name": "CollectProtocol",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "paid0",
    "type": "uint256"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "paid1",
    "type": "uint256"
  }],
  "name": "Flash",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "uint16",
    "name": "observationCardinalityNextOld",
    "type": "uint16"
  }, {
    "indexed": false,
    "internalType": "uint16",
    "name": "observationCardinalityNextNew",
    "type": "uint16"
  }],
  "name": "IncreaseObservationCardinalityNext",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "uint160",
    "name": "sqrtPriceX96",
    "type": "uint160"
  }, {
    "indexed": false,
    "internalType": "int24",
    "name": "tick",
    "type": "int24"
  }],
  "name": "Initialize",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "address",
    "name": "sender",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "indexed": true,
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "amount",
    "type": "uint128"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }],
  "name": "Mint",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "uint8",
    "name": "feeProtocol0Old",
    "type": "uint8"
  }, {
    "indexed": false,
    "internalType": "uint8",
    "name": "feeProtocol1Old",
    "type": "uint8"
  }, {
    "indexed": false,
    "internalType": "uint8",
    "name": "feeProtocol0New",
    "type": "uint8"
  }, {
    "indexed": false,
    "internalType": "uint8",
    "name": "feeProtocol1New",
    "type": "uint8"
  }],
  "name": "SetFeeProtocol",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
  }, {
    "indexed": true,
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "indexed": false,
    "internalType": "int256",
    "name": "amount0",
    "type": "int256"
  }, {
    "indexed": false,
    "internalType": "int256",
    "name": "amount1",
    "type": "int256"
  }, {
    "indexed": false,
    "internalType": "uint160",
    "name": "sqrtPriceX96",
    "type": "uint160"
  }, {
    "indexed": false,
    "internalType": "uint128",
    "name": "liquidity",
    "type": "uint128"
  }, {
    "indexed": false,
    "internalType": "int24",
    "name": "tick",
    "type": "int24"
  }],
  "name": "Swap",
  "type": "event"
}, {
  "inputs": [{
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "internalType": "uint128",
    "name": "amount",
    "type": "uint128"
  }],
  "name": "burn",
  "outputs": [{
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "internalType": "uint128",
    "name": "amount0Requested",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "amount1Requested",
    "type": "uint128"
  }],
  "name": "collect",
  "outputs": [{
    "internalType": "uint128",
    "name": "amount0",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "amount1",
    "type": "uint128"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "internalType": "uint128",
    "name": "amount0Requested",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "amount1Requested",
    "type": "uint128"
  }],
  "name": "collectProtocol",
  "outputs": [{
    "internalType": "uint128",
    "name": "amount0",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "amount1",
    "type": "uint128"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "factory",
  "outputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "fee",
  "outputs": [{
    "internalType": "uint24",
    "name": "",
    "type": "uint24"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "feeGrowthGlobal0X128",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "feeGrowthGlobal1X128",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }, {
    "internalType": "bytes",
    "name": "data",
    "type": "bytes"
  }],
  "name": "flash",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "uint16",
    "name": "observationCardinalityNext",
    "type": "uint16"
  }],
  "name": "increaseObservationCardinalityNext",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "uint160",
    "name": "sqrtPriceX96",
    "type": "uint160"
  }],
  "name": "initialize",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "liquidity",
  "outputs": [{
    "internalType": "uint128",
    "name": "",
    "type": "uint128"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "maxLiquidityPerTick",
  "outputs": [{
    "internalType": "uint128",
    "name": "",
    "type": "uint128"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }, {
    "internalType": "uint128",
    "name": "amount",
    "type": "uint128"
  }, {
    "internalType": "bytes",
    "name": "data",
    "type": "bytes"
  }],
  "name": "mint",
  "outputs": [{
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
  }, {
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "name": "observations",
  "outputs": [{
    "internalType": "uint32",
    "name": "blockTimestamp",
    "type": "uint32"
  }, {
    "internalType": "int56",
    "name": "tickCumulative",
    "type": "int56"
  }, {
    "internalType": "uint160",
    "name": "secondsPerLiquidityCumulativeX128",
    "type": "uint160"
  }, {
    "internalType": "bool",
    "name": "initialized",
    "type": "bool"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "uint32[]",
    "name": "secondsAgos",
    "type": "uint32[]"
  }],
  "name": "observe",
  "outputs": [{
    "internalType": "int56[]",
    "name": "tickCumulatives",
    "type": "int56[]"
  }, {
    "internalType": "uint160[]",
    "name": "secondsPerLiquidityCumulativeX128s",
    "type": "uint160[]"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "bytes32",
    "name": "",
    "type": "bytes32"
  }],
  "name": "positions",
  "outputs": [{
    "internalType": "uint128",
    "name": "liquidity",
    "type": "uint128"
  }, {
    "internalType": "uint256",
    "name": "feeGrowthInside0LastX128",
    "type": "uint256"
  }, {
    "internalType": "uint256",
    "name": "feeGrowthInside1LastX128",
    "type": "uint256"
  }, {
    "internalType": "uint128",
    "name": "tokensOwed0",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "tokensOwed1",
    "type": "uint128"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "protocolFees",
  "outputs": [{
    "internalType": "uint128",
    "name": "token0",
    "type": "uint128"
  }, {
    "internalType": "uint128",
    "name": "token1",
    "type": "uint128"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "uint8",
    "name": "feeProtocol0",
    "type": "uint8"
  }, {
    "internalType": "uint8",
    "name": "feeProtocol1",
    "type": "uint8"
  }],
  "name": "setFeeProtocol",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "slot0",
  "outputs": [{
    "internalType": "uint160",
    "name": "sqrtPriceX96",
    "type": "uint160"
  }, {
    "internalType": "int24",
    "name": "tick",
    "type": "int24"
  }, {
    "internalType": "uint16",
    "name": "observationIndex",
    "type": "uint16"
  }, {
    "internalType": "uint16",
    "name": "observationCardinality",
    "type": "uint16"
  }, {
    "internalType": "uint16",
    "name": "observationCardinalityNext",
    "type": "uint16"
  }, {
    "internalType": "uint8",
    "name": "feeProtocol",
    "type": "uint8"
  }, {
    "internalType": "bool",
    "name": "unlocked",
    "type": "bool"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "int24",
    "name": "tickLower",
    "type": "int24"
  }, {
    "internalType": "int24",
    "name": "tickUpper",
    "type": "int24"
  }],
  "name": "snapshotCumulativesInside",
  "outputs": [{
    "internalType": "int56",
    "name": "tickCumulativeInside",
    "type": "int56"
  }, {
    "internalType": "uint160",
    "name": "secondsPerLiquidityInsideX128",
    "type": "uint160"
  }, {
    "internalType": "uint32",
    "name": "secondsInside",
    "type": "uint32"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "address",
    "name": "recipient",
    "type": "address"
  }, {
    "internalType": "bool",
    "name": "zeroForOne",
    "type": "bool"
  }, {
    "internalType": "int256",
    "name": "amountSpecified",
    "type": "int256"
  }, {
    "internalType": "uint160",
    "name": "sqrtPriceLimitX96",
    "type": "uint160"
  }, {
    "internalType": "bytes",
    "name": "data",
    "type": "bytes"
  }],
  "name": "swap",
  "outputs": [{
    "internalType": "int256",
    "name": "amount0",
    "type": "int256"
  }, {
    "internalType": "int256",
    "name": "amount1",
    "type": "int256"
  }],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "int16",
    "name": "",
    "type": "int16"
  }],
  "name": "tickBitmap",
  "outputs": [{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "tickSpacing",
  "outputs": [{
    "internalType": "int24",
    "name": "",
    "type": "int24"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "internalType": "int24",
    "name": "",
    "type": "int24"
  }],
  "name": "ticks",
  "outputs": [{
    "internalType": "uint128",
    "name": "liquidityGross",
    "type": "uint128"
  }, {
    "internalType": "int128",
    "name": "liquidityNet",
    "type": "int128"
  }, {
    "internalType": "uint256",
    "name": "feeGrowthOutside0X128",
    "type": "uint256"
  }, {
    "internalType": "uint256",
    "name": "feeGrowthOutside1X128",
    "type": "uint256"
  }, {
    "internalType": "int56",
    "name": "tickCumulativeOutside",
    "type": "int56"
  }, {
    "internalType": "uint160",
    "name": "secondsPerLiquidityOutsideX128",
    "type": "uint160"
  }, {
    "internalType": "uint32",
    "name": "secondsOutside",
    "type": "uint32"
  }, {
    "internalType": "bool",
    "name": "initialized",
    "type": "bool"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "token0",
  "outputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "token1",
  "outputs": [{
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "stateMutability": "view",
  "type": "function"
}];
var nUsdUniswapV3Price;
var fetch;

// Listen to all mined tx on N contract
alchemy.ws.on({
  method: AlchemySubscription.MINED_TRANSACTIONS,
  addresses: [{
    to: contractAddress
  }],
  includeRemoved: true,
  hashesOnly: false
}, function (tx) {
  var nbMinPrevious = minutesDifferenceFromNow(timestampLastTx);
  var nbMintable = nbMinPrevious * 60 / 12 + 2; // (NB MIN * 60 secondes) / 12 seconds as 1 N is mintable per this period + 2 as a general buffer
  var pricePerN = mintCost / nbMintable;

  // Log trace last mined tx results
  console.log("" + new Date().toLocaleTimeString() + " From: " + tx.transaction.from + " Minted: " + nbMintable + " maxFeePerGas: " + hexToGwei(tx.transaction.maxFeePerGas) + " maxPriorityFeePerGas: " + hexToGwei(tx.transaction.maxPriorityFeePerGas) + " Mint cost: " + pricePerN + "$");
  timestampLastTx = Date.now();
}); // Listen any kind of tx call on the contract. It's a lazy way to check that any kind of tx is run on the contract

// It's the simplest mint orchestrator that could be done: refresh global var each 20 sec + check if we should try a mint each 11 sec
function mintToken() {
  return _mintToken.apply(this, arguments);
} // FROM N/WETH Uniswap pool
function _mintToken() {
  _mintToken = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return Promise.resolve().then(function () {
            return _interopRequireWildcard(require('node-fetch'));
          });
        case 2:
          fetch = _context3.sent["default"];
          _context3.next = 5;
          return getLastTransactionTime(contractAddress, etherscanAPIKey);
        case 5:
          timestampLastTx = _context3.sent;
          _context3.next = 8;
          return setGlobal();
        case 8:
          setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return setGlobal();
                case 2:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          })), 20 * 1000); // Ensure to update global periodicly to reduce nb op on RPC

          mintTokenNow();
          setInterval( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
            return _regeneratorRuntime().wrap(function _callee2$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return mintTokenNow();
                case 2:
                case "end":
                  return _context2.stop();
              }
            }, _callee2);
          })), 11000); // Validate each X time if we should mint per actual targets
        case 11:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _mintToken.apply(this, arguments);
}
function getNUsdPrice() {
  return _getNUsdPrice.apply(this, arguments);
}
function _getNUsdPrice() {
  _getNUsdPrice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
    var poolContract, _yield$Promise$all, _yield$Promise$all2, slot0, token0, token1, sqrtPriceX96, nbToken1ForOneToken0, tokenPriceInUsd, ethPriceInUsd;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          poolContract = new ethers.Contract(poolAddress, poolABI, web3Provider);
          _context4.next = 3;
          return Promise.all([poolContract.slot0(), poolContract.token0(), poolContract.token1()]);
        case 3:
          _yield$Promise$all = _context4.sent;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 3);
          slot0 = _yield$Promise$all2[0];
          token0 = _yield$Promise$all2[1];
          token1 = _yield$Promise$all2[2];
          sqrtPriceX96 = BigInt(slot0.sqrtPriceX96.toString()); // Convert to BigInt
          nbToken1ForOneToken0 = sqrtPriceX96 * sqrtPriceX96 / (BigInt(1) << BigInt(192)); // (p^2) / 2^192
          if (!(token0.toLowerCase() === wethAddress)) {
            _context4.next = 15;
            break;
          }
          _context4.next = 13;
          return getEthUsdPrice();
        case 13:
          ethPriceInUsd = _context4.sent;
          // This function needs to be implemented or use an API
          tokenPriceInUsd = Number(ethPriceInUsd) / Number(nbToken1ForOneToken0);
        case 15:
          return _context4.abrupt("return", tokenPriceInUsd);
        case 16:
        case "end":
          return _context4.stop();
      }
    }, _callee4);
  }));
  return _getNUsdPrice.apply(this, arguments);
}
function getLastTransactionTime(_x, _x2) {
  return _getLastTransactionTime.apply(this, arguments);
}
function _getLastTransactionTime() {
  _getLastTransactionTime = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(contractAddress, apiKey) {
    var url, response, data, lastTransaction;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) switch (_context5.prev = _context5.next) {
        case 0:
          url = "https://api.etherscan.io/api?module=account&action=txlist&address=".concat(contractAddress, "&startblock=0&endblock=99999999&sort=desc&apikey=").concat(apiKey);
          _context5.prev = 1;
          _context5.next = 4;
          return fetch(url);
        case 4:
          response = _context5.sent;
          _context5.next = 7;
          return response.json();
        case 7:
          data = _context5.sent;
          if (!(data.status === "1" && data.result.length > 0)) {
            _context5.next = 13;
            break;
          }
          lastTransaction = data.result[0];
          return _context5.abrupt("return", new Date(lastTransaction.timeStamp * 1000));
        case 13:
          return _context5.abrupt("return", Date.now());
        case 14:
          _context5.next = 20;
          break;
        case 16:
          _context5.prev = 16;
          _context5.t0 = _context5["catch"](1);
          console.error('Error fetching transaction data:', _context5.t0);
          return _context5.abrupt("return", Date.now());
        case 20:
        case "end":
          return _context5.stop();
      }
    }, _callee5, null, [[1, 16]]);
  }));
  return _getLastTransactionTime.apply(this, arguments);
}
function setGlobal() {
  return _setGlobal.apply(this, arguments);
}
function _setGlobal() {
  _setGlobal = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          _context6.next = 3;
          return web3Provider.getFeeData();
        case 3:
          feeData = _context6.sent;
          _context6.next = 6;
          return getNUsdPrice();
        case 6:
          nUsdUniswapV3Price = _context6.sent;
          targetMaxPrice = nUsdUniswapV3Price * targetMarketPriceFactor; // Target buy price

          maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
          priorityFee = ethers.parseUnits(addTipsGwei, 'gwei');
          priorityFeePerGas = maxPriorityFeePerGas + priorityFee;
          gasPrice = feeData.gasPrice;
          _context6.t0 = Number;
          _context6.next = 15;
          return estimateGas();
        case 15:
          _context6.t1 = _context6.sent;
          estGas = (0, _context6.t0)(_context6.t1);
          gwei = parseFloat(ethers.formatUnits(estGas, 'gwei'));
          _context6.next = 20;
          return getEthUsdPrice();
        case 20:
          ethUsdPrice = _context6.sent;
          _context6.next = 23;
          return getGasPriceEthersJs();
        case 23:
          estGasPrice = _context6.sent;
          totGas = estGas * ethers.formatUnits(estGasPrice, 'gwei') / 1000000000;
          mintCost = totGas * ethUsdPrice; // Cost of a mint in USD
          defaultGasLimit = estGas * 2;
          globalSetDone = true; // Ensure globals has been set at least once before trying a mint
          _context6.next = 32;
          break;
        case 30:
          _context6.prev = 30;
          _context6.t2 = _context6["catch"](0);
        case 32:
        case "end":
          return _context6.stop();
      }
    }, _callee6, null, [[0, 30]]);
  }));
  return _setGlobal.apply(this, arguments);
}
var mintCount = 0; // Used to set some sort of variation on the mint price to try defeating the mint bots

function generateRandomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function mintTokenNow() {
  return _mintTokenNow.apply(this, arguments);
}
function _mintTokenNow() {
  _mintTokenNow = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
    var nbMinPrevious, nbMintable, pricePerN, actualPricePerNTarget;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) switch (_context7.prev = _context7.next) {
        case 0:
          if (!(isMintTx == false && globalSetDone == true && scriptRun == true)) {
            _context7.next = 20;
            break;
          }
          _context7.prev = 1;
          _context7.next = 4;
          return minutesDifferenceFromNow(timestampLastTx);
        case 4:
          nbMinPrevious = _context7.sent;
          nbMintable = nbMinPrevious * 60 / 12 + 2;
          pricePerN = mintCost / nbMintable;
          actualPricePerNTarget = targetMaxPrice;
          if (mintCount != 0) {
            actualPricePerNTarget = targetMaxPrice + generateRandomBetween(-0.002, 0.002);
          }
          console.log("target : " + actualPricePerNTarget + ", Actual estimated cost per N : " + pricePerN);
          if (!(pricePerN < actualPricePerNTarget)) {
            _context7.next = 15;
            break;
          }
          mintCount = mintCount == 2 ? 0 : mintCount + 1;
          console.log('' + new Date().toLocaleTimeString() + ' Gaz gwei ' + gwei + ' : Min since last TX: ' + nbMinPrevious + '  Mintable N: ' + nbMintable + ' Estimated $/N: ' + pricePerN + ' Total est. mint $: ' + mintCost);
          _context7.next = 15;
          return mintTokenOp();
        case 15:
          _context7.next = 20;
          break;
        case 17:
          _context7.prev = 17;
          _context7.t0 = _context7["catch"](1);
          console.log(_context7.t0);
        case 20:
        case "end":
          return _context7.stop();
      }
    }, _callee7, null, [[1, 17]]);
  }));
  return _mintTokenNow.apply(this, arguments);
}
function mintTokenOp() {
  return _mintTokenOp.apply(this, arguments);
}
function _mintTokenOp() {
  _mintTokenOp = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
    var currentNonce, signedTransaction, heads;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) switch (_context9.prev = _context9.next) {
        case 0:
          if (!(isMintTx == false)) {
            _context9.next = 24;
            break;
          }
          isMintTx = true;
          _context9.prev = 2;
          _context9.next = 5;
          return web3Provider.getTransactionCount(wallet.address, "latest");
        case 5:
          currentNonce = _context9.sent;
          _context9.next = 8;
          return minutesDifferenceFromNow(timestampLastTx);
        case 8:
          _context9.t0 = _context9.sent;
          if (!(_context9.t0 > 1)) {
            _context9.next = 18;
            break;
          }
          _context9.next = 12;
          return wallet.signTransaction({
            to: contractAddress,
            data: nContract["interface"].encodeFunctionData("mint"),
            nonce: currentNonce++,
            gasLimit: 100000,
            // Default logical limit
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas + priorityFee,
            maxFeePerGas: feeData.gasPrice * BigInt(120) / BigInt(100),
            // Increased by 20% to encourage miners to pick tx fast
            type: 2,
            chainId: 1
          });
        case 12:
          signedTransaction = _context9.sent;
          _context9.next = 15;
          return web3Provider.send("eth_sendPrivateTransaction", [{
            "tx": signedTransaction,
            "preferences": {
              "fast": true
            }
          }]);
        case 15:
          heads = _context9.sent;
          console.log("" + new Date().toLocaleTimeString() + " Transaction mined: ", heads);

          // Force wait 3 minutes before next trial
          setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8() {
            return _regeneratorRuntime().wrap(function _callee8$(_context8) {
              while (1) switch (_context8.prev = _context8.next) {
                case 0:
                  isMintTx = false;
                  timestampLastTx = Date.now();
                case 2:
                case "end":
                  return _context8.stop();
              }
            }, _callee8);
          })), 3 * 60 * 1000);
        case 18:
          _context9.next = 24;
          break;
        case 20:
          _context9.prev = 20;
          _context9.t1 = _context9["catch"](2);
          console.log(_context9.t1);
          isMintTx = false;
        case 24:
        case "end":
          return _context9.stop();
      }
    }, _callee9, null, [[2, 20]]);
  }));
  return _mintTokenOp.apply(this, arguments);
}
function hexToGwei(hexValue) {
  try {
    var decimalValue = BigInt(hexValue);
    var weiToGwei = BigInt("1000000000");
    var gweiValue = decimalValue / weiToGwei;
    return gweiValue.toString();
  } catch (ex) {
    return 0;
  }
}
function estimateGas() {
  return _estimateGas.apply(this, arguments);
}
function _estimateGas() {
  _estimateGas = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10() {
    var transaction, estimGas;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          transaction = {
            to: contractAddress,
            data: nContract["interface"].encodeFunctionData("mint")
          };
          _context10.next = 4;
          return web3Provider.estimateGas(transaction);
        case 4:
          estimGas = _context10.sent;
          return _context10.abrupt("return", estimGas);
        case 8:
          _context10.prev = 8;
          _context10.t0 = _context10["catch"](0);
        case 10:
        case "end":
          return _context10.stop();
      }
    }, _callee10, null, [[0, 8]]);
  }));
  return _estimateGas.apply(this, arguments);
}
function getGasPriceEthersJs() {
  return _getGasPriceEthersJs.apply(this, arguments);
}
function _getGasPriceEthersJs() {
  _getGasPriceEthersJs = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11() {
    var _gasPrice;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _gasPrice = feeData.gasPrice;
          return _context11.abrupt("return", _gasPrice);
        case 5:
          _context11.prev = 5;
          _context11.t0 = _context11["catch"](0);
          console.error('Failed to get gas price from ethers.js, falling back to Etherscan:', _context11.t0.message);
          return _context11.abrupt("return", null);
        case 9:
        case "end":
          return _context11.stop();
      }
    }, _callee11, null, [[0, 5]]);
  }));
  return _getGasPriceEthersJs.apply(this, arguments);
}
function minutesDifferenceFromNow(dateToCompare) {
  var now = new Date();
  var differenceInMilliseconds = now - dateToCompare;
  var differenceInMinutes = differenceInMilliseconds / (1000 * 60);
  return differenceInMinutes;
}
function checkEthBalanceInUsd() {
  return _checkEthBalanceInUsd.apply(this, arguments);
}
function _checkEthBalanceInUsd() {
  _checkEthBalanceInUsd = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12() {
    var balance, balanceInEth, ethUsdPrice, balanceInUsd;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return web3Provider.getBalance(walletAddress);
        case 2:
          balance = _context12.sent;
          balanceInEth = ethers.formatEther(balance);
          _context12.next = 6;
          return getEthUsdPrice();
        case 6:
          ethUsdPrice = _context12.sent;
          balanceInUsd = (parseFloat(balanceInEth) * ethUsdPrice).toFixed(2);
          return _context12.abrupt("return", balanceInUsd);
        case 9:
        case "end":
          return _context12.stop();
      }
    }, _callee12);
  }));
  return _checkEthBalanceInUsd.apply(this, arguments);
}
function getEthUsdPrice() {
  return _getEthUsdPrice.apply(this, arguments);
}
function _getEthUsdPrice() {
  _getEthUsdPrice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
    var response, data;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) switch (_context13.prev = _context13.next) {
        case 0:
          _context13.prev = 0;
          _context13.next = 3;
          return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        case 3:
          response = _context13.sent;
          _context13.next = 6;
          return response.json();
        case 6:
          data = _context13.sent;
          lastEthUsdPrice = data.ethereum.usd;
          return _context13.abrupt("return", lastEthUsdPrice);
        case 11:
          _context13.prev = 11;
          _context13.t0 = _context13["catch"](0);
          return _context13.abrupt("return", lastEthUsdPrice);
        case 14:
        case "end":
          return _context13.stop();
      }
    }, _callee13, null, [[0, 11]]);
  }));
  return _getEthUsdPrice.apply(this, arguments);
}