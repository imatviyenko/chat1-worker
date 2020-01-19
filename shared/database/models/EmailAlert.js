const mongoose = require('mongoose');

const constants = require('../../constants');

const schemaOptions = {
  collection: 'emailAlerts',
  strict: true, // ignore fields not defined in the schema
  timestamps: true // add createdAt and updatedAt fields
};

const schema = new mongoose.Schema(
  {
    email: { type: String, index: true, required: true },
    type: { type: String, index: true, required: true, enum: [constants.EMAIL_TYPE_CONFIRMATION_LINK, constants.EMAIL_TYPE_REGISTRATION_REQUEST, constants.EVENT_CHAT_NEW_MESSAGES] },
    body: { type: String, required: true },
    subject: { type: String,  required: true },
    status: { type: String, index: true, required: true, enum: [constants.EMAIL_STATUS_QUEUED, constants.EMAIL_STATUS_SENT, constants.EMAIL_STATUS_FAILED] },
  },
  schemaOptions
);


var model = mongoose.model('EmailAlert', schema);
module.exports = model;