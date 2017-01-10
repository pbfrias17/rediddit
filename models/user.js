import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  comments: [
    { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subrediddit'
    }
  ]
});

userSchema.plugin(passportLocalMongoose);
var User = mongoose.model('User', userSchema);

export default User;