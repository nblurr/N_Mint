import { z } from 'zod';
import { rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnGetTokenMetadataBySymbolInputSchema = z
    .object({
    symbol: z.string(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnGetTokenMetadataBySymbolInputSchema };
