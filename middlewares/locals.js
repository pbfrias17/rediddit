/* Collection of middleware functions used to 
*  localize data for view templates and other
*  use-cases
*/

import mongoose from 'mongoose';
import request from 'request';
import consume from 'consume-http-header';
import User from '../models/user';
import Subrediddit from '../models/subrediddit';
import Post from '../models/post';
import Comment from '../models/comment';

const importUser = (req, res, next) => {
  res.locals.user = req.user;
  next();
}

const importTopSubs = (req, res, next) => {
  if(req.method === 'GET') {
    Subrediddit.find({}, (err, subs) => {
      if(err) {
        console.log('ERR on topSubs.find(): ' + err);
      } else {
        res.locals.topSubs = subs;
      }
      
      next(); 
    });
  } else {
    next();
  }
}

const importCurrentSub = (req, res, next) => {
  // populate 'posts' when at r/subName
  const populateField = ( req.url.length <= 1 ) ? 'posts' : '';
  
  Subrediddit.findOne({ name: req.params.name }).
  populate(populateField).exec((err, sub) => {
    if(err) {
      console.log('ERR on sub.find(): ' + err);
    } else {
      console.log('populated ' + populateField);
      res.locals.sub = sub; 
    }
    
    next();
  });
}


const importCurrentPost = (req, res, next) => {
  Post.findById(req.params.post_id, (err, post) => {
    if(err) {
      console.log('ERR on post.find(id): ' + err);
    } else {
      res.locals.post = post;
    }
  });  
}

export { importUser, importTopSubs, importCurrentSub, importCurrentPost };