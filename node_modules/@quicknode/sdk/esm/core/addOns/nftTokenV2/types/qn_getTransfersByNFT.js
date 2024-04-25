import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnGetTransfersByNFTInputSchema = z
    .object({
    collection: isEvmAddress,
    collectionTokenId: z.string(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnGetTransfersByNFTInputSchema };
