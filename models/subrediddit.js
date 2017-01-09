import mongoose from 'mongoose';

var subredidditSchema = new mongoose.Schema({
  name: String,
  description: String,
  subscribers: { type: Array, default: [] },
  posts: { type: Array, default: [] }
});

var Subrediddit = mongoose.model('Subrediddit', subredidditSchema);

export default Subrediddit;