class QNChainNotSupported extends Error {
    constructor(endpointUrl) {
        super(`The chain for endpoint URL ${endpointUrl} is not currently supported by the QuickNode SDK.`);
    }
}

export { QNChainNotSupported };
