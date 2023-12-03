const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  bio: String,
  age: Number,
  password: { type: String, required: true },
  blacklisted:  {
    status: { type: Boolean, default: false },
    token: { type: String, default: null }
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
