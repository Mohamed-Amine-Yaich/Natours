const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//Schema object
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },

  email: {
    type: String,
    required: [true, 'Provide your email'],
    unique: true,
    lowercase: true,
    //convert email to lowercase
    //use validator package from npm tovalidate email
    //validator.validate("test@email.com")(from npm )
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  //path of photo
  //most secure pass the longest ones not with symbol
  //you can implement (at least...)
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false, //for not show when we get data
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    // this only works on CREATE and SAVE method!!!! (veryf model method)
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'passwords not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordRestToken: String,
  passwordRestExpires: Date,
});

//use mongoose document middelware
userSchema.pre('save', async function (next) {
  //run the function when the password field is modified
  if (!this.isModified('password')) return next();

  //hashing the password (hash method is async )

  this.password = await bcrypt.hash(this.password, 12);

  //this field is required input but not required to be persisted in db
  this.passwordConfirm = undefined;
  next();
});


userSchema.pre('save',function(next) {
  if( !this.isModified('password') || this.isNew )return next()

  //to ensure that the password changed before the creation of the token
  //cause in the rest password we have to resign a token and save when the password change
  //and we can't use a token that been given before the password change cause(protect middleware)
this.passwordChangedAt = Date.now() - 1000
  next();
})


//creating a instance method that available for all document of user collection
//for comparing the passwords (the normal one and the encrypted one )
//candidate password from the body



userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//instance methode for check password changed
userSchema.methods.changesPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const passwordtimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(this.passwordChangedAt, JWTtimestamp);
    return JWTtimestamp < passwordtimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //instance methods for creating the token (with  crypto  build in module)
  //no need for strong password
  //1-gernerate resettoken
  const resetToken = crypto.randomBytes(32).toString('hex');
  //2-encrypt resettoken  /2- saved in db
  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log('restToken &&encrypted restToken(db)');
  console.log({ resetToken }, this.passwordRestToken);
  //reset token expired in 10 min and store it object fields in db
  this.passwordRestExpires = Date.now() + 1000 * 60 * 10;

  //return the not encrypted one for send it in the email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
