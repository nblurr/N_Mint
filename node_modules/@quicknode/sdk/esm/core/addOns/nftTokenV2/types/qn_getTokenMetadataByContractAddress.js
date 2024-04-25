import { z } from 'zod';
import { isEvmAddress } from '../../../../lib/validation/validators.js';

const qnGetTokenMetadataByCAInputSchema = z
    .object({
    contract: isEvmAddress,
})
    .strict();

export { qnGetTokenMetadataByCAInputSchema };
