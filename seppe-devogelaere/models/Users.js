var mongoose = require('mongoose');
var crypto = require('crypto'); 
var jwt = require('jsonwebtoken'); 

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String 
});

UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex'); 

    crypto.pbkdf2(password, this.salt, 1000, 64, function(err,key) {
        this.hash = key.toString('hex');
        if(err) {
            throw err; 
        }
        console.log('inside the function key is ' + key.toString('hex')); 
        this.hash = key.toString('hex');
        this.save();
    }.bind(this));
};

UserSchema.methods.validatePassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash == hash; 
};

UserSchema.methods.generateJWT = function() {
    console.log('generating  jwt');
    var today = new Date(); 
    var exp = new Date(today); 
    console.log('generating  jwt 2');
    exp.setDate(today.getDate() + 60); 
    console.log('exp in sec ' + exp.getTime()/1000); 
    console.log('generating  jwt 6');
    
    console.log('returning jwt');
    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000), 
    }, 'Seret'); 
}; 

mongoose.model('User', UserSchema);

