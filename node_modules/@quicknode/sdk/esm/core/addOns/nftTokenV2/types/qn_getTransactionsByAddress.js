import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnGetTransactionsByAddressInputSchema = z
    .object({
    address: isEvmAddress,
    fromBlock: z.number().positive().nullish(),
    toBlock: z.number().positive().nullish(),
})
    .merge(rpcPaginationParams)
    .strict()
    .refine(({ fromBlock, toBlock }) => {
    if (fromBlock && toBlock)
        return fromBlock < toBlock;
    return true;
}, { message: 'fromBlock must be less than toBlock' });

export { qnGetTransactionsByAddressInputSchema };
