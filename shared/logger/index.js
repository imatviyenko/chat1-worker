const {serializeError} = require('serialize-error');

function setContext(context) {
    this.context = context;
}

function log(message) {
    const _message = `${message}`;
    this.context.log(_message);
};

function error(message) {
    const _message = `${JSON.stringify(serializeError(message))}`;
    this.context.error(_message);
};


const logger = {
    setContext,
    log,
    error
};

module.exports = logger;