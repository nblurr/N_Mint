// genAuthKey.mjs
import { Wallet } from 'ethers';

const wallet = Wallet.createRandom();
console.log('🪪 Auth Wallet Address:', wallet.address);
console.log('🔑 Auth Wallet Private Key:', wallet.privateKey);