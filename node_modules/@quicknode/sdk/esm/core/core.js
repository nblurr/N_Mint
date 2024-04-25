import { createClient, http, publicActions } from 'viem';
import { nftAndTokenActions } from './addOns/nftTokenV2/actions.js';
import { deriveChainFromUrl } from './chains.js';
import { setupGlobalFetch } from '../lib/helpers/globalFetch.js';

const buildQNActions = (config) => {
    return (client) => ({
        ...nftAndTokenActions(client, config),
    });
};
class Core {
    constructor({ endpointUrl, chain, config = {} }) {
        setupGlobalFetch();
        this.endpointUrl = endpointUrl;
        const baseClient = createClient({
            chain: chain || deriveChainFromUrl(endpointUrl),
            transport: http(this.endpointUrl),
        }).extend(publicActions);
        const qnClient = baseClient.extend(buildQNActions(config));
        this.client = qnClient;
    }
}

export { Core, buildQNActions };
