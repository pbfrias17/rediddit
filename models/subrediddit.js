import mongoose from 'mongoose';

var subredidditSchema = new mongoose.Schema({
  name: String,
  description: String,
  subscribers: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    }
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ]
});

var Subrediddit = mongoose.model('Subrediddit', subredidditSchema);

export default Subrediddit;