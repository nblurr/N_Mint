import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnFetchNFTsByCollectionInputSchema = z
    .object({
    collection: isEvmAddress,
    tokens: z.array(z.string()).nullish(),
    omitFields: z.array(z.string()).nullish(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnFetchNFTsByCollectionInputSchema };
