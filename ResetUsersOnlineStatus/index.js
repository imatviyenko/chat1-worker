const logger = require('../shared/logger');

const {openDatabaseConnection, resetStaleUsersOnlineStatus} = require('../shared/database');

module.exports = async function (context, myTimer) {
    logger.setContext(context);
    logger.log(`ResetUsersOnlineStatus invoked at ${new Date().toISOString()}`);

    await openDatabaseConnection();
    await resetStaleUsersOnlineStatus();
};