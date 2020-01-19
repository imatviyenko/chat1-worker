const mongoose = require('mongoose');

const schemaOptions = {
  collection: 'users',
  strict: true, // ignore fields not defined in the schema
  timestamps: true // add createdAt and updatedAt fields
};

const schema = new mongoose.Schema(
  {
    email: { type: String, index: true, unique: true, required: true },
    displayName: String,
    passwordHash: String,
    status: { type: String, index: true, required: true },
    isOnline: { type: Boolean, index: true },
    lastOnlinePingTimestamp: { type: Date, index: true},
    emailConfirmationCode: String,
    contacts: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  schemaOptions
);


var model = mongoose.model('User', schema);
module.exports = model;