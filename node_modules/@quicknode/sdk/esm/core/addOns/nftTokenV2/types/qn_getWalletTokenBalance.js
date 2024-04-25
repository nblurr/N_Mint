import { z } from 'zod';
import { isEvmAddress, rpcPaginationParams } from '../../../../lib/validation/validators.js';

const qnGetWalletTokenBalanceInputSchema = z
    .object({
    wallet: isEvmAddress,
    contracts: z.array(isEvmAddress).nullish(),
})
    .merge(rpcPaginationParams)
    .strict();

export { qnGetWalletTokenBalanceInputSchema };
