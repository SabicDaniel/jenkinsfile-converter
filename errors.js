const util = require('util');

class CustomError extends Error {
    /**
     * @type {'server' | 'client'}
     */
    errorSide;

    /**
     * @param {string} rid
     * @param {string} errorName
     * @param {'server' | 'client'} errorSide
     * @param {string} msg 
     */
    constructor(rid, errorName, errorSide, msg, originalError) {
        super();

        this.rid = rid;
        this.name = errorName;
        this.errorSide = errorSide;
        this.message = msg;
        this.originalError = originalError;

        if (originalError) {
            this.message += `\nOriginal error:\n    ${util.format(originalError).replace(/\n/g, '\n    ')}`.replace(/\n/g, '\n    ');
        }

        // TODO: Metrics submission
    }
}

class ServerError extends CustomError {
    constructor(rid, errorName, msg, originalError) {
        super(rid, errorName, 'server', msg, originalError);
    }
}

class ClientError extends CustomError {
    constructor(rid, errorName, msg, originalError) {
        super(rid, errorName, 'client', msg, originalError);
    }

}

class UpperStreamError extends ServerError {
    constructor(rid, msg, originalError, rawResponse) {
        super(rid, 'UpperStreamError', msg, originalError);

        if (rawResponse) {
            this.rawResponse = rawResponse;
            this.message += `\nRaw response:\n    ${JSON.stringify(rawResponse).replace(/\n/g, '\n    ')}`.replace(/\n/g, '\n    ');
        }
    }
}

class ParseFailure extends ClientError {
    constructor(rid, msg, originalError) {
        super(rid, 'ParseFailure', msg, originalError);
    }
}

class MapperError extends ServerError {
    constructor(rid, msg, originalError, rawInput) {
        super(rid, 'MapperError', msg, originalError);

        if (rawInput) {
            this.rawInput = rawInput;
            this.message += `\nRaw input:\n    ${JSON.stringify(rawInput).replace(/\n/g, '\n    ')}`.replace(/\n/g, '\n    ');
        }
    }
}

module.exports = { CustomError, ServerError, ClientError, UpperStreamError, ParseFailure, MapperError };
