const logger = require('../logger');

const sgMail = require('@sendgrid/mail');

function initMailer() {
    process.env.SENDGRID_API_KEY ?
        logger.log(`mailer.initMailer -> process.env.SENDGRID_API_KEY is configured`)
        : 
        logger.error(`mailer.initMailer -> process.env.SENDGRID_API_KEY is NOT configured!`); 

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
};

async function sendEmailAlert(emailAlert) {
    logger.log(`mailer.sendEmailAlert  -> emailAlert: ${emailAlert}`);

    const msg = {
        to: emailAlert.email,
        from: 'noreply@em7400.chat1.imatviyenko.xyz',
        subject: emailAlert.subject,
        html: emailAlert.body
    };
    await sgMail.send(msg);
}
    
module.exports =  {
    initMailer,
    sendEmailAlert
};


