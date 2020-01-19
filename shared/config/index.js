const config = {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat1?replicaSet=rs0'
};

module.exports = config;