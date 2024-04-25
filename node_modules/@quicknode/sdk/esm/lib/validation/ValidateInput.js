import { QNInputValidationError } from '../errors/QNInputValidationError.js';

function formatErrors(baseError) {
    const errorMessages = [];
    baseError.errors.forEach((error) => {
        errorMessages.push(`${error.path.length > 0 ? error.path + ': ' : ''}${error.message}`);
    });
    return errorMessages.length > 0
        ? new QNInputValidationError({
            messages: errorMessages,
            zodError: baseError,
        })
        : null;
}

export { formatErrors };
