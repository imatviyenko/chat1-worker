const logger = require('../../shared/logger');

const mongoose = require('mongoose');

const config = require('../../shared/config');
const constants = require('../constants');
const User = require('./models/User');
const UpdateUserOnlineStatus = require('./models/UpdateUserOnlineStatus');
const EmailAlert = require('./models/EmailAlert');


// Initialize Mongoose and connect to MongoDB database
const initMongoose = async () => {
    const mongodbUri = config.mongodbUri;
    logger.log(`initMongoose -> mongodbUri: ${mongodbUri}`);
    await mongoose.connect(mongodbUri, {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });

};

// Disconnect from MongoDB database
const closeMongooseConnection = async () => {
    await mongoose.disconnect();
};


async function getUsersByContactId(contactUserId) {
    const queryLiteral = {
        "contacts": contactUserId
    };

    const query = User.find(queryLiteral); // get only _id and isOnline property of all matching users
    const dbResult = await query.lean().exec();
    logger.log(`getUsersByContactId -> dbResult: ${JSON.stringify(dbResult)}`);
    return dbResult;
}



async function resetStaleUsersOnlineStatus() {
    logger.log(`resetStaleUsersOnlineStatus invoked`);
    
    const now = new Date();
    const cutoffTimestamp = now.setSeconds(now.getSeconds() - (constants.PING_SERVER_INTERVAL_SECONDS * 2)); // user is stale if at least two pings are missed
    const queryLiteral = {
        isOnline: true,
        lastOnlinePingTimestamp: {
            '$lt': cutoffTimestamp
        }
    };
    logger.log(`resetStaleUsersOnlineStatus -> queryLiteral: ${JSON.stringify(queryLiteral)}`);

    const getStaleUsersIdsQuery = User.find(queryLiteral, '_id'); // get list of users ids
    const staleUsersDocs = await getStaleUsersIdsQuery.lean().exec(); //  staleUsersDocs: [{"_id":"5e24770f2604f11a50a3514d"}]
    const staleUsersIds = staleUsersDocs.map( u => u._id );
    logger.log(`resetStaleUsersOnlineStatus -> staleUsersIds: ${JSON.stringify(staleUsersIds)}`);
    

    if (Array.isArray(staleUsersIds) && staleUsersIds.length > 0) {
        // reset each stale user's online status
        const queryLiteral2 = {
            _id: {
                $in: staleUsersIds
            }
        };
        
        // reset isOnline property for found stale users
        await User.updateMany(queryLiteral2, {isOnline: false});
        
        // for each stale user, create an UpdateUserOnlineStatus record to notify all server instances and clients that the user uses went offline
        let promises = staleUsersIds.map( async staleUserId => {
            logger.log(`resetStaleUsersOnlineStatus -> staleUserId: ${staleUserId}`);
            const dbUsers  = await getUsersByContactId(staleUserId); // get users who has the current stale user in the list of contacts
            const affectedUsers  = dbUsers.map( u => ({_id: u._id, email: u.email, isOnline: u.isOnline}) );
            logger.log(`resetStaleUsersOnlineStatus -> affectedUsers: ${JSON.stringify(affectedUsers)}`);
            const docUpdateUserOnlineStatus = new UpdateUserOnlineStatus({
                userId: staleUserId,
                isOnline: false,
                affectedUsers
            });
            await docUpdateUserOnlineStatus.save(); // AWAIT for save operation to complete
        });
        return Promise.all(promises); // wait for each stale user offline status update to be written to the database
    }
}


function getQueuedEmailAlerts() {
    logger.log(`getQueuedEmailAlerts invoked`);
    const queryLiteral = {
        status: constants.EMAIL_STATUS_QUEUED
    };
    logger.log(`getQueuedEmailAlerts -> queryLiteral: ${JSON.stringify(queryLiteral)}`);

    const query = EmailAlert.find(queryLiteral); // get list of queued email alerts
    return query.lean().exec(); 
}


function setEmailAlertStatus(id, status) {
    logger.log(`setEmailAlertStatus invoked`);
    logger.log(`setEmailAlertStatus -> id: ${id}, status: ${status}`);
    const queryLiteral = {
        _id: id
    };
    logger.log(`setEmailAlertStatus -> queryLiteral: ${JSON.stringify(queryLiteral)}`);

    const query = EmailAlert.findOneAndUpdate(queryLiteral, {status}); // update email alert status
    return query.exec(); 
}

module.exports = {
    initMongoose,
    closeMongooseConnection,
    resetStaleUsersOnlineStatus,
    getQueuedEmailAlerts,
    setEmailAlertStatus
};