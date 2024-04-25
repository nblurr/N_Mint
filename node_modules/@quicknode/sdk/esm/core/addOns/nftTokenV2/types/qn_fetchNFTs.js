import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnFetchNFTInputSchema = z
    .object({
    wallet: isEvmAddress,
    contracts: z.array(isEvmAddress).nullish(),
    omitFields: z.array(z.string()).nullish(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnFetchNFTInputSchema };
