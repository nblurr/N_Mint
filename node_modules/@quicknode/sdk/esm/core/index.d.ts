import { Chain, PublicClient } from 'viem';
import { z } from 'zod';

type SimplifyType<T> = T extends object ? {
    [K in keyof T]: SimplifyType<T[K]>;
} : T;

type NftTrait = {
    trait_type: string;
    value: string;
};
type RpcNftAsset = {
    collectionName: string;
    collectionTokenId: string;
    collectionAddress: string;
    name: string;
    description: string;
    imageUrl: string;
    traits: NftTrait[];
    chain: string;
    network: string;
};
type RPCTokenMetadata = {
    name: string | null;
    symbol: string | null;
    contractAddress: string;
    decimals: string | null;
    genesisBlock: string | null;
    genesisTransaction: string | null;
};

declare const qnFetchNFTInputSchema: z.ZodObject<{
    wallet: z.ZodString;
    contracts: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    omitFields: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    wallet: string;
    contracts?: string[] | null | undefined;
    omitFields?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    wallet: string;
    contracts?: string[] | null | undefined;
    omitFields?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNFetchNFTInput = z.infer<typeof qnFetchNFTInputSchema>;
type QNFetchNFTResult = {
    owner: string;
    assets: RpcNftAsset[];
    totalPages: number;
    totalItems: number;
    pageNumber: number;
};

declare const qnFetchNFTCollectionDetailsInputSchema: z.ZodObject<{
    contracts: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    contracts: string[];
}, {
    contracts: string[];
}>;
type QNFetchNFTCollectionDetailsInput = z.infer<typeof qnFetchNFTCollectionDetailsInputSchema>;
type RPCNftCollectionDetails = {
    name: string;
    address: string;
    description: string;
    erc1155: boolean;
    erc721: boolean;
    totalSupply: number;
    circulatingSupply: number;
    genesisBlock: number | null;
    genesisTransaction: string | null;
};
type QNFetchNFTCollectionDetailsResult = RPCNftCollectionDetails[];

declare const qnFetchNFTsByCollectionInputSchema: z.ZodObject<{
    omitFields: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    collection: z.ZodString;
    tokens: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    collection: string;
    omitFields?: string[] | null | undefined;
    tokens?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    collection: string;
    omitFields?: string[] | null | undefined;
    tokens?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNFetchNFTsByCollectionInput = z.infer<typeof qnFetchNFTsByCollectionInputSchema>;
type QNFetchNFTsByCollectionResult = {
    collection: string;
    tokens: RpcNftAsset[];
};

declare const qnGetTransfersByNFTInputSchema: z.ZodObject<{
    collection: z.ZodString;
    collectionTokenId: z.ZodString;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    collection: string;
    collectionTokenId: string;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    collection: string;
    collectionTokenId: string;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNGetTransfersByNFTInput = z.infer<typeof qnGetTransfersByNFTInputSchema>;
type TransfersByNFTTransfer = {
    blockNumber: number;
    date: string;
    from: string;
    to: string;
    txHash: string;
};
type QNGetTransfersByNFTResult = {
    collection: string;
    transfers: TransfersByNFTTransfer[];
    totalPages: number;
    pageNumber: number;
    totalItems: number;
};

declare const qnVerifyNFTsOwnerInputSchema: z.ZodObject<{
    wallet: z.ZodString;
    contracts: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    wallet: string;
    contracts: string[];
}, {
    wallet: string;
    contracts: string[];
}>;
type QNVerifyNFTsOwnerInput = z.infer<typeof qnVerifyNFTsOwnerInputSchema>;
type QNVerifyNFTsOwnerResult = {
    owner: string;
    assets: string[];
};

declare const qnGetTokenMetadataByCAInputSchema: z.ZodObject<{
    contract: z.ZodString;
}, "strict", z.ZodTypeAny, {
    contract: string;
}, {
    contract: string;
}>;
type QNGetTokenMetadataByCAInput = z.infer<typeof qnGetTokenMetadataByCAInputSchema>;
type QNGetTokenMetadataByCAResult = RPCTokenMetadata;

declare const qnGetTokenMetadataBySymbolInputSchema: z.ZodObject<{
    symbol: z.ZodString;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    symbol: string;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    symbol: string;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNGetTokenMetadataBySymbolInput = z.infer<typeof qnGetTokenMetadataBySymbolInputSchema>;
type QNGetTokenMetadataBySymbolResult = {
    tokens: RPCTokenMetadata[];
};

declare const qnGetTransactionsByAddressInputSchema: z.ZodEffects<z.ZodObject<{
    address: z.ZodString;
    fromBlock: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    toBlock: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>, {
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNGetTransactionsByAddressInput = z.infer<typeof qnGetTransactionsByAddressInputSchema>;
interface RPCTransactionByAddress {
    blockTimestamp: string;
    transactionHash: string;
    blockNumber: string;
    transactionIndex: number;
    fromAddress: string;
    toAddress: string;
    contractAddress: string | null;
    value: string;
}
type QNGetTransactionsByAddressResult = {
    paginatedItems: RPCTransactionByAddress[];
    totalItems: number;
    totalPages: number;
    pageNumber: number;
};

declare const qnGetWalletTokenBalanceInputSchema: z.ZodObject<{
    wallet: z.ZodString;
    contracts: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    wallet: string;
    contracts?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    wallet: string;
    contracts?: string[] | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNGetWalletTokenBalanceInput = z.infer<typeof qnGetWalletTokenBalanceInputSchema>;
type RPCWalletTokenBalance = {
    quantityIn: string;
    quantityOut: string;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    address: string;
    totalBalance: string;
};
type QNGetWalletTokenBalanceResult = {
    result: RPCWalletTokenBalance[];
    totalItems: number;
    totalPages: number;
    pageNumber: number;
};

declare const qnGetWalletTokenTransactionsInputSchema: z.ZodObject<{
    contract: z.ZodString;
    address: z.ZodString;
    fromBlock: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    toBlock: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    perPage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    contract: string;
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}, {
    contract: string;
    address: string;
    fromBlock?: number | null | undefined;
    toBlock?: number | null | undefined;
    perPage?: number | null | undefined;
    page?: number | null | undefined;
}>;
type QNGetWalletTokenTransactionsInput = z.infer<typeof qnGetWalletTokenTransactionsInputSchema>;
type RPCFullTokenMetadata = {
    address: string;
    genesisBlock: string | null;
    genesisTransaction: string | null;
    name: string | null;
    symbol: string | null;
    decimals: string | null;
    contractAddress: string;
};
type RPCTokenTransaction = {
    blockNumber: string;
    transactionHash: string;
    toAddress: string;
    fromAddress: string;
    logIndex: number;
    type: string;
    timestamp: string;
    receivedTokenContractAddress: string | null;
    sentTokenContractAddress: string | null;
    sentAmount: string;
    receivedAmount: string;
    decimalSentAmount: string;
    decimalReceivedAmount: string;
};
type QNGetWalletTokenTransactionsResult = {
    paginatedItems: RPCTokenTransaction[];
    totalItems: number;
    totalPages: number;
    pageNumber: number;
    token: RPCFullTokenMetadata;
};

type NFTAndTokenActions = {
    /**
     * Returns aggregated data on NFTs for a given wallet.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_fetchNFTs_v2
     *
     * @param args - {@link QNFetchNFTInput}
     * @returns response - {@link QNFetchNFTsResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_fetchNFTs({
     *   wallet: "0xD10E24685c7CDD3cd3BaAA86b09C92Be28c834B6",
     *   contracts: ['0x2106C00Ac7dA0A3430aE667879139E832307AeAa'],
     * });
     */
    qn_fetchNFTs: (args: SimplifyType<QNFetchNFTInput>) => Promise<SimplifyType<QNFetchNFTResult>>;
    /**
     * Returns aggregated data on NFTs for a given wallet.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_fetchNFTCollectionDetails_v2
     *
     * @param args - {@link QNFetchNFTCollectionDetailsInput}
     * @returns response - {@link QNFetchNFTCollectionDetailsResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_fetchNFTCollectionDetails({
     *   contracts: [
     *     "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
     *     "0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7",
     *   ]
     * });
     */
    qn_fetchNFTCollectionDetails: (args: SimplifyType<QNFetchNFTCollectionDetailsInput>) => Promise<SimplifyType<QNFetchNFTCollectionDetailsResult>>;
    /**
     * Returns aggregated data on NFTs within a given collection.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_fetchNFTsByCollection_v2
     *
     * @param args - {@link QNFetchNFTsByCollectionInput}
     * @returns response - {@link QNFetchNFTsByCollectionResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_fetchNFTsByCollection({
     *   collection: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
     * })
     */
    qn_fetchNFTsByCollection: (args: SimplifyType<QNFetchNFTsByCollectionInput>) => Promise<SimplifyType<QNFetchNFTsByCollectionResult>>;
    /**
    * Returns transfers by given NFT.
    *
    * - Docs: https://www.quicknode.com/docs/ethereum/qn_getTransfersByNFT_v2
    *
    * @param args - {@link QNGetTransfersByNFTInput}
    * @returns response - {@link QNGetTransfersByNFTResult}
    *
    * @example
    * import QuickNode from '@quicknode/sdk';
    *
    * const core = new QuickNode.Core({
    *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
    *   config: {
    *     addOns: { nftTokenV2: true }
    *   }
    * }
    *
    * const response = await core.client.qn_getTransfersByNFT({
    *   collection: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6",
  7 *   collectionTokenId: "1",
    * })
    */
    qn_getTransfersByNFT: (args: SimplifyType<QNGetTransfersByNFTInput>) => Promise<SimplifyType<QNGetTransfersByNFTResult>>;
    /**
     * Confirms ownership of specified NFTs for a given wallet.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_verifyNFTsOwner_v2
     *
     * @param args - {@link QNVerifyNFTsOwnerInput}
     * @returns response - {@link QNVerifyNFTsOwnerResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_verifyNFTsOwner({
     *  wallet: "0x91b51c173a4bdaa1a60e234fc3f705a16d228740",
     *  contracts: [
     *    "0x2106c00ac7da0a3430ae667879139e832307aeaa:3643",
     *    "0xd07dc4262bcdbf85190c01c996b4c06a461d2430:133803",
     *   ],
     * })
     *
     */
    qn_verifyNFTsOwner: (args: SimplifyType<QNVerifyNFTsOwnerInput>) => Promise<SimplifyType<QNVerifyNFTsOwnerResult>>;
    /**
     * Returns token details for specified contract.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_getTokenMetadataByContractAddress_v2
     *
     * @param args - {@link QNGetTokenMetadataByCAInput}
     * @returns response - {@link QNGetTokenMetadataByCAResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_getTokenMetadataByContractAddress({
     *   contract: "0x2106c00ac7da0a3430ae667879139e832307aeaa",
     * })
     */
    qn_getTokenMetadataByContractAddress: (args: SimplifyType<QNGetTokenMetadataByCAInput>) => Promise<SimplifyType<QNGetTokenMetadataByCAResult | null>>;
    /**
     * Returns token details for specified token symbol.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_getTokenMetadataBySymbol_v2
     *
     * @param args - {@link QNGetTokenMetadataBySymbolInput}
     * @returns response - {@link QNGetTokenMetadataBySymbolResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_getTokenMetadataBySymbol({
     *   symbol: "DAI",
     * })
     */
    qn_getTokenMetadataBySymbol: (args: SimplifyType<QNGetTokenMetadataBySymbolInput>) => Promise<SimplifyType<QNGetTokenMetadataBySymbolResult>>;
    /**
     * Returns transactions within a specified wallet address.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_getTransactionsByAddress_v2
     *
     * @param args - {@link QNGetTransactionsByAddressInput}
     * @returns response - {@link QNGetTransactionsByAddressResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_getTransactionsByAddress({
     *   address: "0xD10E24685c7CDD3cd3BaAA86b09C92Be28c834B6"
     * })
     */
    qn_getTransactionsByAddress: (args: SimplifyType<QNGetTransactionsByAddressInput>) => Promise<SimplifyType<QNGetTransactionsByAddressResult>>;
    /**
     * Returns ERC-20 tokens and token balances within a wallet.
     *
     * - Docs: https://www.quicknode.com/docs/ethereum/qn_getWalletTokenBalance_v2
     *
     * @param args - {@link QNGetWalletTokenBalanceInput}
     * @returns response - {@link QNGetWalletTokenBalanceResult}
     *
     * @example
     * import QuickNode from '@quicknode/sdk';
     *
     * const core = new QuickNode.Core({
     *   endpointUrl: "https://some-cool-name.quiknode.pro/abcd1234",
     *   config: {
     *     addOns: { nftTokenV2: true }
     *   }
     * }
     *
     * const response = await core.client.qn_getWalletTokenBalance({
     *  address: "0xD10E24685c7CDD3cd3BaAA86b09C92Be28c834B6"
     * })
     */
    qn_getWalletTokenBalance: (args: SimplifyType<QNGetWalletTokenBalanceInput>) => Promise<SimplifyType<QNGetWalletTokenBalanceResult>>;
    qn_getWalletTokenTransactions: (args: SimplifyType<QNGetWalletTokenTransactionsInput>) => Promise<SimplifyType<QNGetWalletTokenTransactionsResult>>;
};

interface CoreArguments {
    endpointUrl: string;
    chain?: Chain;
    config?: QNCoreClientConfig;
}
type QNCoreClientConfig = {
    addOns?: {
        nftTokenV2: boolean;
    };
};
type QNCoreClient = PublicClient & NFTAndTokenActions;

declare class Core {
    readonly endpointUrl: string;
    readonly client: QNCoreClient;
    constructor({ endpointUrl, chain, config }: CoreArguments);
}

export { Core as default };
