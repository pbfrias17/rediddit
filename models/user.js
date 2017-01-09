import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  comments: { type: Array, default: [] }, 
  subscriptions: { type: Array, default: [] }
});

userSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', userSchema);

export default User;