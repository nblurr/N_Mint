import { z } from 'zod';
import { isEvmAddress } from '../../../../lib/validation/validators.js';

const qnFetchNFTCollectionDetailsInputSchema = z
    .object({
    contracts: z.array(isEvmAddress),
})
    .strict();

export { qnFetchNFTCollectionDetailsInputSchema };
