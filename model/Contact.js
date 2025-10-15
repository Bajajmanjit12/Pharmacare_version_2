// server/models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  handled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
