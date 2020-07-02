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

        if (originalError) {
            this.originalError = originalError;
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
            this.rawResponse = JSON.stringify(rawResponse);
        }
    }
}

class ParseFailure extends ClientError {
    constructor(rid, msg, userInput) {
        super(rid, 'ParseFailure', msg);
        this.userInput = userInput.toString();
    }
}

class MapperError extends ServerError {
    constructor(rid, msg, originalError, rawInput) {
        super(rid, 'MapperError', msg, originalError);

        if (rawInput) {
            this.rawInput = JSON.stringify(rawInput);
        }
    }
}

module.exports = { CustomError, ServerError, ClientError, UpperStreamError, ParseFailure, MapperError };
