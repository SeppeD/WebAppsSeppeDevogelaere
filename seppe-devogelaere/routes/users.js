var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var passport = require('passport'); 
var User = mongoose.model('User'); 

/* To register a user 
*/


router.post('/register', function(req, res, next) {
    if(!req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Please fill out all form fields'}); 
    }

    var user = new User(); 
    console.log(req.body, " in the /register route");
    user.username = req.body.username; 
    user.setPassword(req.body.password);
    
    user.save(function(err) { 
        if (err) {
          return res.status(400).json({
            message: 'Username already exists.'
        });
      }
      if(err) { console.log(err); return next(err); } 

      console.log(req.body, " in the /register route 2");
      return res.json({ 
        token: user.generateJWT()
    });
  }); 
});

router.post('/login', function(req, res, next) { 
    if(!req.body.username || !req.body.password) { 
        return res.status(400).json({
            message: 'Please fill out all of the fields'
        }); 
    }

    passport.authenticate('local', function(err, user, info) {
        if(err) { return next(err); } 

        if(user) { 
            return res.json({token: user.generateJWT()});
        } else { 
            return res.status(401).json(info); 
        }
    })(req, res, next); 
}); 

module.exports = router;
