// mintCoordinator.mjs
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Shared secret (must be the same for all bots)
const SECRET_KEY = process.env.WARRIOR_PRIVATE_KEY;

// Time interval for slot rotation (e.g. every 60 seconds)
const INTERVAL_MS = 600_000;

/**
 * Picks a wallet index from the provided wallet array using HMAC-SHA256.
 * All bots using the same SECRET_KEY and INTERVAL_MS will derive the same result.
 *
 * @param {number} currentTime - Current timestamp in ms (use Date.now()).
 * @param {string[]} walletAddresses - Array of wallet addresses to choose from.
 * @returns {string} - The selected wallet address.
 */
export function pickWallet(currentTime, walletAddresses) {
    if (!walletAddresses || walletAddresses.length === 0) {
        throw new Error('No wallets provided for mint coordination');
    }

    const slot = Math.floor(currentTime / INTERVAL_MS);
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(slot.toString());
    const hash = hmac.digest();

    // Convert first 4 bytes to a deterministic pseudo-random index
    const index = hash.readUInt32BE(0) % walletAddresses.length;

    return walletAddresses[index];
}