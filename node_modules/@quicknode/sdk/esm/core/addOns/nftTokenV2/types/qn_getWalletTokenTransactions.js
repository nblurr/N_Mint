import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnGetWalletTokenTransactionsInputSchema = z
    .object({
    address: isEvmAddress,
    contract: isEvmAddress,
    fromBlock: z.number().positive().nullish(),
    toBlock: z.number().positive().nullish(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnGetWalletTokenTransactionsInputSchema };
