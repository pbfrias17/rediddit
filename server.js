var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var consume = require('consume-http-header');
var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/rediddit');

/* Local Data */
var topSubs = [];

/* Database */
/* UPDATE these to use referencing */
var subredidditSchema = new mongoose.Schema({
  name: String,
  description: String,
  subscribers: { type: Array, default: [] },
  posts: { type: Array, default: [] }
});

var postSchema = new mongoose.Schema({
  title: String,
  body: String,
  dateCreated: { type: Date, default: Date.now },
  author: { type: String, default: 'unknown' },
  comments: { type: Array, default: [] },
  subrediddit: String,
  votes: { type: Object, default: { up: 0, down: 0 } }
});

var commentSchema = new mongoose.Schema({
  body: String,
  author: { type: String, default: 'unknown' },
  parents: { type: String, default: '' },
  votes: { type: Object, default: { up: 0, down: 0 } },
  post_id: String
});

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  comments: Array, 
  subscriptions: Array
});

var Subrediddit = mongoose.model('Subrediddit', subredidditSchema);
var Post = mongoose.model('Post', postSchema);
var Comment = mongoose.model('Comment', commentSchema);
var User = mongoose.model('User', userSchema);

/*Post.create({ 
  title: 'Test Post 1', 
  body: 'This is the body for Test Post 1',
  author: 'Tester1'
}, function(err, post) {
  if(err) {
    console.log('ERR on Post.create()');
  } else {
    console.log('Post Created:');
    console.log(post);
  }
});*/

/*Subrediddit.create([
  { name: 'explainlikeimsix' },
  { name: 'muchsleep' },
  { name: 'jifs' },
  { name: 'askrediddit' },
  { name: 'todayialreadyknew' },
  { name: 'titifu' }
], function(err, subs) {
  if(err) {
    console.log('something went wrong when creating subs');
  } else {
    console.log(subs);
  }
});*/


/* Routes */
app.get('/', function(req, res) {
  Subrediddit.find({}, function(err, subs) {
    if(err) {
      console.log('ERR on Sub.find()');
    } else {
      topSubs = subs;
      
      res.render('index', { topSubs: topSubs });
    }
  });
});

app.get('/subrediddits/new', function(req, res) {
  res.render('new_sub', { topSubs: topSubs });
});

app.post('/subrediddits', function(req, res) {
  Subrediddit.create({
    name: req.body.name,
    description: req.body.desc
  }, function(err, sub) {
    if(err) {
      console.log('ERR on Sub.create()');
    } else {
      res.redirect('/');
    }
  });
});

app.post('/games', function(req, res) {
  //make sure the imgURL is a valid URL for an image
  var imgURL = 'http://pisces.bbystatic.com/BestBuy_US/store/ee/2015/vg/pm/videogamecontroller-1000x555_blue.jpg;maxHeight=309;maxWidth=457';
  var verOptions = { url: req.body.imgURL, method: 'HEAD' };
  
  request(verOptions, function(err, res, body) {
    if(err || res.statusCode != 200 || !res.headers['content-type'].includes('image')) {
      console.log('Something is wrong with imgURL provided');
    } else {
      imgURL = req.body.imgURL; 
    }
  });
  
  Post.create({
    name: req.body.gameTitle,
    img: imgURL
  }, function(err, game) {
    if(err) {
      console.log('ERR on Game.create()');
      res.redirect('/games/new');
    } else {
      console.log('Created new Game');
      res.redirect('/games'); 
    }
  });
});

app.get('/r/:name', function(req, res) {
  Subrediddit.find({ name: req.params.name }, function(err, subs) {
    if(err) {
      console.log('ERR from Sub.find(name)');
      //show 'subrediddit not found' page
      
    } else {
      Post.find({ subrediddit: req.params.name }, function(err, posts) {
        if(err) {
          console.log('ERR from Post.find(name)');
        } else {
          res.render('show_sub', { topSubs: subs, sub: subs[0], posts: posts });
        }
      })
    }
  });
});

app.post('/r/:name', function(req, res) {
  Post.create({
    title: req.body.title,
    body: req.body.body,
    subrediddit: req.params.name
  }, function(err, post) {
    if(err) {
      console.log('ERR on post.create()');
    } else {
      console.log('posting to ' + req.params.name);
      res.redirect('/r/' + req.params.name); 
    }
  });
});

app.get('/r/:name/new', function(req, res) {
  res.render('new_post', { topSubs: topSubs, subName: req.params.name });
});

app.post('/r/:name/comments/:post_id', function(req, res) {
  // less verification necessary since we can only comment
  // from within the post
  Comment.create({
    body: req.body.body,
    post_id: req.params.post_id 
  }, function(err, comment) {
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

app.get('/r/:name/comments/:post_id', function(req, res) {
  // there must be a better way than this!
  Subrediddit.find({ name: req.params.name }, function(err, subs) {
    if(err) {
      //subrediddit not found
      console.log('ERR on Sub.find(name)');
    } else {
      Post.findById(req.params.post_id, function(err, post) {
        if(err) {
          //post not found
          console.log('ERR on Post.find(id)');
        } else {
          Comment.find({ post_id: req.params.post_id }, function(err, comments) {
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

app.listen(process.env.PORT, process.env.IP, function() {
  console.log('Server listening...');
});