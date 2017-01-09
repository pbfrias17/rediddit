import mongoose from 'mongoose';

var commentSchema = new mongoose.Schema({
  body: String,
  author: { type: String, default: 'unknown' },
  parents: { type: String, default: '' },
  votes: { type: Object, default: { up: 0, down: 0 } },
  post_id: String
});

var Comment = mongoose.model('Comment', commentSchema);

export default Comment;