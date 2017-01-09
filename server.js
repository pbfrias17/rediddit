//var express = require('express');
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import request from 'request';
import consume from 'consume-http-header';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import flash from 'connect-flash';
import seedDB from './seeds';
import { importLocals } from './middlewares/locals';
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
seedDB();

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

// these middlewares must occur AFTER passport middlwares
app.use(importLocals);

/* Local Data */
var topSubs = [];


/* Routes */
app.get('/', (req, res) => {
  Subrediddit.find({}, (err, subs) => {
    if(err) {
      console.log('ERR on Sub.find()');
    } else {
      topSubs = subs;
      res.render('index', { topSubs: topSubs });
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register', { topSubs: topSubs, errorFlash: req.flash('reg_error') });
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
  res.render('new_sub', { topSubs: topSubs });
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
  Subrediddit.find({ name: req.params.name }, (err, subs) => {
    if(err) {
      console.log('ERR from Sub.find(name)');
      //show 'subrediddit not found' page
      
    } else {
      Post.find({ subrediddit: req.params.name }, (err, posts) => {
        if(err) {
          console.log('ERR from Post.find(name)');
        } else {
          res.render('show_sub', { topSubs: subs, sub: subs[0], posts: posts });
        }
      })
    }
  });
});

app.post('/r/:name', (req, res) => {
  Post.create({
    title: req.body.title,
    body: req.body.body,
    subrediddit: req.params.name
  }, (err, post) => {
    if(err) {
      console.log('ERR on post.create()');
    } else {
      console.log('posting to ' + req.params.name);
      res.redirect('/r/' + req.params.name); 
    }
  });
});

app.get('/r/:name/new', (req, res) => {
  res.render('new_post', { topSubs: topSubs, subName: req.params.name });
});

app.post('/r/:name/comments/:post_id', (req, res) => {
  // less verification necessary since we can only comment
  // from within the post
  Comment.create({
    body: req.body.body,
    post_id: req.params.post_id 
  }, (err, comment) => {
    if(err) {
      console.log('ERR on Comment.create()');
    } else {
      console.log(req);
      console.log(req.body);
      console.log(req.params);
      
      res.redirect(req.url);
    }
  });
});

app.get('/r/:name/comments/:post_id', (req, res) => {
  // there must be a better way than this!
  Subrediddit.find({ name: req.params.name }, (err, subs) => {
    if(err) {
      //subrediddit not found
      console.log('ERR on Sub.find(name)');
    } else {
      Post.findById(req.params.post_id, (err, post) => {
        if(err) {
          //post not found
          console.log('ERR on Post.find(id)');
        } else {
          Comment.find({ post_id: req.params.post_id }, (err, comments) => {
            if(err) {
              console.log('ERR on Comment.find(subrediddit)');
            } else {
              res.render('show_post', { topSubs: topSubs, comments: comments, post: post, sub: subs[0]})
            }
          });
        }
      }); 
    }
  });
});


app.listen(process.env.PORT, process.env.IP, () => {
  console.log('Server listening...');
});