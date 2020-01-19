const logger = require('../shared/logger');
const constants = require('../shared/constants');

const {initMongoose, getQueuedEmailAlerts, setEmailAlertStatus, closeMongooseConnection } = require('../shared/database');
const mailer = require('../shared/mailer');

module.exports = async function (context, timer) {
    logger.setContext(context);
    logger.log(`SendEmailAlerts invoked at ${new Date().toISOString()}`);

    await initMongoose();
    const queuedEmailAlerts = await getQueuedEmailAlerts();
    logger.log(`SendEmailAlerts -> queuedEmailAlerts: ${JSON.stringify(queuedEmailAlerts)}`);
    await closeMongooseConnection();

    if (Array.isArray(queuedEmailAlerts) && queuedEmailAlerts.length > 0) {
        mailer.initMailer();
        const promises = queuedEmailAlerts.map( async emailAlert => {
            try {
                await mailer.sendEmailAlert(emailAlert);
                await setEmailAlertStatus(emailAlert._id, constants.EMAIL_STATUS_SENT);
            } catch (e) {
                logger.error(`Error sending email to ${emailAlert.email}:`);
                logger.error(e);
                await setEmailAlertStatus(emailAlert._id, constants.EMAIL_STATUS_FAILED);
            };
        });
        return Promise.all(promises);
    }
};