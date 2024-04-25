import { z } from 'zod';
import { isEvmAddress } from '../../../../lib/validation/validators.js';

const qnVerifyNFTsOwnerInputSchema = z
    .object({
    wallet: isEvmAddress,
    contracts: z.array(z.string()), // TODO: make this enforce the address:id format
})
    .strict();

export { qnVerifyNFTsOwnerInputSchema };
