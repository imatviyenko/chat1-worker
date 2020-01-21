const logger = require('../shared/logger');
const constants = require('../shared/constants');

const {openDatabaseConnection, getQueuedEmailAlerts, setEmailAlertStatus } = require('../shared/database');
const mailer = require('../shared/mailer');
const Bottleneck = require("bottleneck");

module.exports = async function (context, timer) {
    logger.setContext(context);
    logger.log(`SendEmailAlerts invoked at ${new Date().toISOString()}`);

    await openDatabaseConnection();
    const queuedEmailAlerts = await getQueuedEmailAlerts();
    logger.log(`SendEmailAlerts -> queuedEmailAlerts: ${JSON.stringify(queuedEmailAlerts)}`);
    
    
    // DEBUG ONLY !!! Clone queuedEmailAlerts[0] for testing rate limiting
    // **********************************************
    /*
    if (queuedEmailAlerts.length > 0) {
        const alert = {
            ...queuedEmailAlerts[0]
        };
        logger.log(`SendEmailAlerts -> alert: ${JSON.stringify(alert)}`);
    
        for (let i = 0; i < 19; i++) {
            const _alert = {
                ...alert
            };
            queuedEmailAlerts.push(_alert);
        };
        logger.log(`SendEmailAlerts -> queuedEmailAlerts: ${JSON.stringify(queuedEmailAlerts)}`);
    }
    */
    // **********************************************


    const func = async emailAlert => {
        try {
            await mailer.sendEmailAlert(emailAlert);
            await setEmailAlertStatus(emailAlert._id, constants.EMAIL_STATUS_SENT);
        } catch (e) {
            logger.error(`Error sending email to ${emailAlert.email}:`);
            logger.error(e);
            await setEmailAlertStatus(emailAlert._id, constants.EMAIL_STATUS_FAILED);
        };
    };

    // https://www.npmjs.com/package/bottleneck
    // two emails per second rate limiter
    const limiter = new Bottleneck({
        maxConcurrent: 1,
        minTime: 500 // no more than 2 emails per second, that is at least 500 milliseconds between each call
    });
    const funcWithLimiter = limiter.wrap(func);

    if (Array.isArray(queuedEmailAlerts) && queuedEmailAlerts.length > 0) {
        mailer.initMailer();
        const promises = queuedEmailAlerts.map(funcWithLimiter);
        return Promise.all(promises);
    }
};