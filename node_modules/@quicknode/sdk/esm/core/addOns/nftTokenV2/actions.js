import { formatErrors } from '../../../lib/validation/ValidateInput.js';
import { checkAddOnEnabled } from '../shared/helpers.js';
import { qnFetchNFTInputSchema } from './types/qn_fetchNFTs.js';
import { qnFetchNFTCollectionDetailsInputSchema } from './types/qn_fetchNFTCollectionDetails.js';
import { qnFetchNFTsByCollectionInputSchema } from './types/qn_fetchNFTsByCollection.js';
import { qnGetTransfersByNFTInputSchema } from './types/qn_getTransfersByNFT.js';
import { qnVerifyNFTsOwnerInputSchema } from './types/qn_verifyNFTsOwner.js';
import { qnGetTokenMetadataByCAInputSchema } from './types/qn_getTokenMetadataByContractAddress.js';
import { qnGetTokenMetadataBySymbolInputSchema } from './types/qn_getTokenMetadataBySymbol.js';
import { qnGetTransactionsByAddressInputSchema } from './types/qn_getTransactionsByAddress.js';
import { qnGetWalletTokenBalanceInputSchema } from './types/qn_getWalletTokenBalance.js';
import { qnGetWalletTokenTransactionsInputSchema } from './types/qn_getWalletTokenTransactions.js';

function nftAndTokenValidator(config, schema, args) {
    checkAddOnEnabled(config.addOns?.nftTokenV2 ?? false, 'NFT And Token RPC API V2', 'nftTokenV2');
    // Uses zod to validate schema at runtime
    const validation = schema.safeParse(args);
    if (!validation.success) {
        const formattedErrors = formatErrors(validation.error);
        if (formattedErrors)
            throw formattedErrors;
    }
}
const nftAndTokenActions = (client, config) => ({
    async qn_fetchNFTCollectionDetails(args) {
        nftAndTokenValidator(config, qnFetchNFTCollectionDetailsInputSchema, args);
        const response = await client.request({
            method: 'qn_fetchNFTCollectionDetails',
            params: [args],
        });
        return response;
    },
    async qn_fetchNFTs(args) {
        nftAndTokenValidator(config, qnFetchNFTInputSchema, args);
        const response = await client.request({
            method: 'qn_fetchNFTs',
            params: [args],
        });
        return response;
    },
    async qn_fetchNFTsByCollection(args) {
        nftAndTokenValidator(config, qnFetchNFTsByCollectionInputSchema, args);
        const response = await client.request({
            method: 'qn_fetchNFTsByCollection',
            params: [args],
        });
        return response;
    },
    async qn_getTransfersByNFT(args) {
        nftAndTokenValidator(config, qnGetTransfersByNFTInputSchema, args);
        const response = await client.request({
            method: 'qn_getTransfersByNFT',
            params: [args],
        });
        return response;
    },
    async qn_verifyNFTsOwner(args) {
        nftAndTokenValidator(config, qnVerifyNFTsOwnerInputSchema, args);
        const response = await client.request({
            method: 'qn_verifyNFTsOwner',
            params: [args],
        });
        return response;
    },
    async qn_getTokenMetadataByContractAddress(args) {
        nftAndTokenValidator(config, qnGetTokenMetadataByCAInputSchema, args);
        const response = await client.request({
            method: 'qn_getTokenMetadataByContractAddress',
            params: [args],
        });
        return response;
    },
    async qn_getTokenMetadataBySymbol(args) {
        nftAndTokenValidator(config, qnGetTokenMetadataBySymbolInputSchema, args);
        const response = await client.request({
            method: 'qn_getTokenMetadataBySymbol',
            params: [args],
        });
        return response;
    },
    async qn_getTransactionsByAddress(args) {
        nftAndTokenValidator(config, qnGetTransactionsByAddressInputSchema, args);
        const response = await client.request({
            method: 'qn_getTransactionsByAddress',
            params: [args],
        });
        return response;
    },
    async qn_getWalletTokenBalance(args) {
        nftAndTokenValidator(config, qnGetWalletTokenBalanceInputSchema, args);
        const response = await client.request({
            method: 'qn_getWalletTokenBalance',
            params: [args],
        });
        return response;
    },
    async qn_getWalletTokenTransactions(args) {
        nftAndTokenValidator(config, qnGetWalletTokenTransactionsInputSchema, args);
        const response = await client.request({
            method: 'qn_getWalletTokenTransactions',
            params: [args],
        });
        return response;
    },
});

export { nftAndTokenActions };
