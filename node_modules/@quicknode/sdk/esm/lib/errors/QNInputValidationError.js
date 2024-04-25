class QNInputValidationError extends Error {
    constructor({ messages, zodError, }) {
        super(`QuickNode SDK Input Validation Error: ${messages.join(', ')}`);
        this.messages = messages;
        this.issues = zodError.issues;
        this.zodError = zodError; // see https://github.com/colinhacks/zod/blob/HEAD/ERROR_HANDLING.md
    }
}

export { QNInputValidationError };
