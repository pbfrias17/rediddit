import mongoose from 'mongoose';

var postSchema = new mongoose.Schema({
  title: String,
  body: String,
  dateCreated: { type: Date, default: Date.now },
  author: { type: String, default: 'unknown' },
  comments: { type: Array, default: [] },
  subrediddit: String,
  votes: { type: Object, default: { up: 0, down: 0 } }
});

var Post = mongoose.model('Post', postSchema);

export default Post;