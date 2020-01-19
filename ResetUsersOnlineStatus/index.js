const logger = require('../shared/logger');

const {initMongoose, resetStaleUsersOnlineStatus, closeMongooseConnection} = require('../shared/database');

module.exports = async function (context, myTimer) {
    logger.setContext(context);
    logger.log(`ResetUsersOnlineStatus invoked at ${new Date().toISOString()}`);

    await initMongoose();
    await resetStaleUsersOnlineStatus();
    await closeMongooseConnection();
};