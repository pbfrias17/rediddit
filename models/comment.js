import mongoose from 'mongoose';

var commentSchema = new mongoose.Schema({
  body: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
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

var Comment = mongoose.model('Comment', commentSchema);

export default Comment;