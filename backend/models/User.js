const mongoose = require('mongoose');
// Changed the userSchema by adding an attribute called wallet
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  wallet: { type: Number, required: true, default: 0.0 }, // Added wallet attribute
});

const User = mongoose.model('User', userSchema);
module.exports = User;
