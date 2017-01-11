import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import request from 'request';
import consume from 'consume-http-header';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import flash from 'connect-flash';
import seedDB from './seeds';
import { importUser, importTopSubs, importCurrentSub } from './middlewares/locals';
import User from './models/user';
import Subrediddit from './models/subrediddit';
import Post from './models/post';
import Comment from './models/comment';

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/rediddit');
// Use bluebird
mongoose.Promise = require('bluebird');
//seedDB();

/* Passport Configuration */
app.use(require('express-session')({
  secret: 'I secretly Redid Reddit',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Middlwares
*  must be after passport middlwares
*/
app.use(importUser);
app.use(importTopSubs);
app.use('/r/:name/', importCurrentSub);

/* Routes */
app.get('/', (req, res) => {
  Post.find({}).sort('-dateCreated').exec((err, posts) => {
    if(err) {
      console.log('ERR on Post.find.sort(): ' + err);
    } else {
      res.render('index', { posts });
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register', { errorFlash: req.flash('reg_error') });
});

app.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, (err, user) => {
    if(err) {
      console.log(err);
      req.flash('reg_error', err.message);
      res.redirect('/register');
    } else {
      // if registration successful, login user
      passport.authenticate('local')(req, res, () => {
        res.redirect('/');
      });
    }
  });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/'
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/subrediddits/new', (req, res) => {
  res.render('new_sub');
});

app.post('/subrediddits', (req, res) => {
  Subrediddit.create({
    name: req.body.name,
    description: req.body.desc
  }, (err, sub) => {
    if(err) {
      console.log('ERR on Sub.create()');
    } else {
      res.redirect('/');
    }
  });
});

app.get('/r/:name', (req, res) => {
  res.render('show_sub');
});

app.post('/r/:name', (req, res) => {
  Post.create({
    title: req.body.title,
    body: req.body.body,
    subrediddit: req.params.name,
    author: req.user
  }, (err, post) => {
    if(err) {
      console.log('ERR post.create(): ' + err);
    } else {
      res.locals.sub.posts.push(post);
      res.locals.sub.save((err, data) => {
        if(err) {
          console.log('ERR on sub.save(): ' + err);
        } else {
          res.redirect('/r/' + req.params.name);
        }
      });
    }
  });
});

app.get('/r/:name/new', (req, res) => {
  res.render('new_post', { subName: req.params.name });
});

app.post('/r/:name/comments/:post_id', (req, res) => {
  // less verification necessary since we can only comment
  // from within the post
  Comment.create({
    body: req.body.body,
    author: req.user,
    post: req.params.post_id 
  }, (err, comment) => {
    if(err) {
      console.log('ERR on Comment.create(): ' + err);
    } else {
      Post.findById(req.params.post_id, (err, post) => {
        if(err) {
          console.log('ERR on Post.find(): ' + err);
        } else {
          post.comments.push(comment);
          post.save((err, data) => {
            if(err) {
              // could not save
            } else {
              res.redirect(req.url); 
            }
          });
        }
      });
    }
  });
});

app.get('/r/:name/comments/:post_id', (req, res) => {
  Post.findById(req.params.post_id).populate({ 
    path: 'comments',
    populate: { path: 'author' },
  }).populate('author').exec((err, post) => {
    if(err) {
      res.render('dne_page');  
    } else {
      if(post.subrediddit != res.locals.sub.name) {
        res.render('dne_page');
      } else {
        res.render('show_post', { post });
      }
    }
  });
});

app.post('/r/:name/votes/:post_id', (req, res) => {
  console.log(req.headers);
  res.send('thanks for voting!');
});

app.listen(process.env.PORT, process.env.IP, () => {
  console.log('Server listening...');
});