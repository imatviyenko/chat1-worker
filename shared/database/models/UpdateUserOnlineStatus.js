const mongoose = require('mongoose');

const schemaOptions = {
  collection: 'updatesUserOnlineStatus',
  strict: true, // ignore fields not defined in the schema
  timestamps: true, // add createdAt and updatedAt fields
  capped: 100000
};

const schema = new mongoose.Schema(
  {
    userId: { type : mongoose.Schema.Types.ObjectId, index: true, required: true },
    isOnline: { type: Boolean, index: true },
    affectedUsers: [
      {
        _id: { type : mongoose.Schema.Types.ObjectId, required: true },
        email: { type : String, required: true},
        isOnline: {type: Boolean}
      }
    ]
  },
  schemaOptions
);


var model = mongoose.model('UpdateUserOnlineStatus', schema);
module.exports = model;