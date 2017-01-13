import mongoose from 'mongoose';

var postSchema = new mongoose.Schema({
  title: String,
  body: { type: String, default: '(No Description)' },
  dateCreated: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  subrediddit: String,
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  
      },
      value: { type: Number, default: 0 }
    }
  ]
});

var Post = mongoose.model('Post', postSchema);

export default Post;