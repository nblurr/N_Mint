import * as _solana_web3_js from '@solana/web3.js';
import { Transaction, PublicKey, Keypair, SendOptions, Connection } from '@solana/web3.js';

type PercentileRangeUnion = '0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50' | '55' | '60' | '65' | '70' | '75' | '80' | '85' | '90' | '95' | '100';
type PriorityFeeLevels = 'low' | 'medium' | 'high' | 'extreme';
interface PriorityFeeRequestPayload {
    method: string;
    params: {
        last_n_blocks?: number;
        account?: string;
    };
    id: number;
    jsonrpc: string;
}
interface PriorityFeeEstimates {
    extreme: number;
    high: number;
    low: number;
    medium: number;
    percentiles: {
        [key in PercentileRangeUnion]: number;
    };
}
interface PriorityFeeResponseData {
    jsonrpc: string;
    result: {
        context: {
            slot: number;
        };
        per_compute_unit: PriorityFeeEstimates;
        per_transaction: PriorityFeeEstimates;
    };
    id: number;
}
interface EstimatePriorityFeesParams {
    last_n_blocks?: number;
    account?: string;
}
interface SolanaClientArgs {
    endpointUrl: string;
}
interface SmartTransactionBaseArgs {
    transaction: Transaction;
    feeLevel?: PriorityFeeLevels;
}
interface PrepareSmartTransactionArgs extends SmartTransactionBaseArgs {
    payerPublicKey: PublicKey;
}
interface SendSmartTransactionArgs extends SmartTransactionBaseArgs {
    keyPair: Keypair;
    sendTransactionOptions?: SendOptions;
}

declare class Solana {
    readonly endpointUrl: string;
    readonly connection: Connection;
    constructor({ endpointUrl }: SolanaClientArgs);
    /**
     * Sends a transaction with a dynamically generated priority fee based on the current network conditions and compute units needed by the transaction.
     */
    sendSmartTransaction(args: SendSmartTransactionArgs): Promise<string>;
    /**
     * Prepares a transaction to be sent with a dynamically generated priority fee based
     * on the current network conditions. It adds a `setComputeUnitPrice` instruction to the transaction
     * and simulates the transaction to estimate the number of compute units it will consume.
     * The returned transaction still needs to be signed and sent to the network.
     */
    prepareSmartTransaction(args: PrepareSmartTransactionArgs): Promise<_solana_web3_js.Transaction>;
    fetchEstimatePriorityFees(args?: EstimatePriorityFeesParams): Promise<PriorityFeeResponseData>;
    private createDynamicPriorityFeeInstruction;
    private getSimulationUnits;
}

export { EstimatePriorityFeesParams, PrepareSmartTransactionArgs, PriorityFeeEstimates, PriorityFeeLevels, PriorityFeeRequestPayload, PriorityFeeResponseData, SendSmartTransactionArgs, SmartTransactionBaseArgs, SolanaClientArgs, Solana as default };
