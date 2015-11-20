var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require('express-jwt'); 
var auth = jwt({secret: 'Seret', userProperty: 'payload'});



//get access to the models defined in the models folder  
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var passport = require('passport'); 
var User = mongoose.model('User'); 

/**
 * This option sets the manual path for the 
 * html files that are requested by the Angular
 * app and sent through Express 
 * */
var options = {
    root: path.join(process.cwd(), '/views/')
};


/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(options.root + " sending index");
    res.sendFile('index.html', options, function(err) {
        if(err) {
        res.status(err.status).end();
        }
    });
});

/** This function will directly map 
 * a templateUrl from angular to the 
 * corresponding resource on the server
 * */
router.get('/partials/:name', function(req, res, next) {
    var name = req.params.name; 
    var filePath = path.join('partials/', name + '.html');
    res.sendFile(filePath, options, function(err) {
        if(err) {
            res.status(err.status).end();
        }
    });
});



var myModels = {'comment': Comment, 'post': Post}; 


/** return all posts in json */ 
router.get('/posts', function (req, res, next) {
    Post.find(function(err, posts) {
        if(err) { return next(err); }

        res.json(posts);
    });
});

/** add a post to database */ 
router.post('/posts', auth, function(req, res, next) {
    console.log(req.body);
    var post = new Post(req.body);
    console.log(post);
    post.author = req.payload.username;
    console.log(post);

    post.save(function(err, post) { 
        if(err) { return next(err); }

        res.json(post);
    });
});

/**
* This function pasres a url with :post and assigns 
* a post property to req obj, :post is a variable 
* for the post id 
*/
router.param('post', function(req, res, next, id) {
   var query = Post.findById(id);
   query.exec(function(err, post) { 
       if(err) { return next(err); }
       if(!post) { return next(new Error('can\'t find post')); }
       req.post = post;
       next(); 
   });
});

/**
* Delete a post by id and all related comments
*/
router.delete('/posts/:post', function(req, res, next) {
    Post.findByIdAndRemove(req.post.id, function(err, doc) {
        if(err) { console.log("err in delete"); return next(new Error('can\'t delete post')); }
        
        console.log(doc);
        
        var i = doc.comments.length; 
        console.log(doc.comments.length);
        /*jshint -W083 */
        // disable js warning for function inside loop
        while(i--) { 
            Comment.findByIdAndRemove(doc.comments[i], function(err, result) {
                console.log(result);
                if(err) { /** handle **/ }
            });
        }

        res.json(doc);
    });  
});
/**
* increment upvote of post by 1
*/
router.put('/posts/:post/upvote', auth, function(req, res, next) {
    console.log(req); 
    req.post.upvote(function(err, post) { 
        if(err) { return next(err); } 

        res.json(post); 
    });
});

/**
* and a comment to a post object  
*/
router.post('/posts/:post/comments', auth, function(req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post; 
    comment.author = req.payload.username;

    comment.save(function(err, comment) {
        if(err) { return next(err); }

        req.post.comments.push(comment); 
        req.post.save(function(err, post) {
            if(err) { return next(err); }

        res.json(comment); 
        });
    });
});

/**
* get a post and all the realted comments
*/
router.get('/posts/:post', function(req, res, next) {
    req.post.populate('comments', function(err, post) {
        if(err) { return next(err); } 

        res.json(post); 
    });
});

/**
* parses the query string to assign req the comment object 
* property
*/
router.param('comment', function(req, res, next, id) {
   Comment.findById(id, function(err, comment) {
       if(err) { next(err); } 
       if(!comment) { next(new Error('can\'t find post')); }
       
       req.comment = comment;
       next(); 
   });
});

/**
* uses :post and :upvote to upvote a comment 
*/
router.put('/posts/:post/comments/:comment/upvotes', 
           auth,
           function(req, res, next) {
    req.comment.upvote(function(err, comm) {
        if(err) { next(err); } 
        
        res.json(comm);
    });
});

module.exports = router;
