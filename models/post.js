import mongoose from 'mongoose';

var postSchema = new mongoose.Schema({
  title: String,
  body: String,
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
  votes: { type: Object, default: { up: 0, down: 0 } }
});

var Post = mongoose.model('Post', postSchema);

export default Post;