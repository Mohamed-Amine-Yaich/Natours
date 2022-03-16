//const util = require('util')//for using promisify method (not using callbacks)
// use distructure to get the only the method
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken  = (user,statusCode,res)=>{
  const token  = signToken(user._id)
  //we not using https we will activate in production
  const  cookieOptions = {
    expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN* 24 *60*60*1000),
   // secure : true,//https on production only
    httpOnly :true
    //this mean that cookie cannot be access or modified by the browser
    //browser will receive the cookie store it and send it along with each request
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt',token,cookieOptions)
 //remove the password from the output data of the user
  user.password =undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data : {
      user
    }
  });
}


//creating of an account
//when creating or signup it automatic logged in we need to send JWT to the user
exports.signup = catchAsync(async (req, res, next) => {
  //methode applie on model
  //forgot await : give unhandled promise rejection
  //for not specify a role we dont use req.body
  // !!!!const newUser = await  User.create(req.body)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  //create of the token  data in payload ,secret(32 caracters long) ,when jwt expire
  //const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET, { expiresIn:process.env.JWT_EXPIRES_IN })

  createSendToken(newUser,201,res)

  /*const token = signToken(newUser._id);

  res.status(201).json({
    message: 'success',
    token,
    data: {
      newUser,
    },
  });*/

});

exports.login = catchAsync(async (req, res, next) => {
  //distructre
  const { email, password } = req.body;

  //1)check if email and password exist
  if (!email || !password) {
    return next(new appError('please set your email and password', 400));
  }

  //2)check if user and password exist
  //return user with the password field
  const user = await User.findOne({ email: email }).select('+password');
  console.log('user by id in login' + user);
  //cant await and ther is not user
  // const correct = await user.correctPassword(password,user.password)

  //instance methode(work on document not on model)!!!!!!!!!!!!
  //if ( !(user && await user.correctPassword(password,user.password)))
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError('Incorrect email or password', 401));
  }
 /* // 3)send jwt if every thing is ok
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });*/
 createSendToken(user,200,res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //1)chek if there is a token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log(token)
  if (!token) {
    return next(new appError('you are not log in please log in ', 401));
  }
  //2)verification token
  //(token, secret , callback)//we change the callback with promisify for promise
  //return the id or paylod
  //2type of error when can produce invalid token or expired token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded :' + decoded);
  //3)chek if user still exists mean while
  console.log('req.user :' + req.user);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new appError('there is no longer user that belong to this token', 401)
    );
  }

  //4)check if user change password after the token was issued ()
  //iat :issued at
  if (currentUser.changesPasswordAfter(decoded.iat)) {
    return next(
      new appError('you have changed the password ! please log in again', 401)
    );
  }

  //take us to next middleware the next router
  //grand access to protected
  //put the user data in the req to pass from middleware and middleware*for use it later*
  req.user = currentUser;
  console.log('req.user after asign current user' + req.user);
  next();
});

//take function that retrun the middleware functiion
//and take as parms the roles that prmetted to pass
//pass
//
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //test if role of current useris inculde in the roles tables
    //or the current user is passed in the req in the protect middleware(req.user =currentuser)
    if (!roles.includes(req.user.role))
      return next(
        new appError('your do not have permission to perfor this action  ', 403) //status code forbidden
      );

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)get usr by his posted email in the body and verify that he exist in db

  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('there is no user with this email adress.', 404));
  }
  //2/)generate  the reset token
  //use instance methode to separate user data from controller (fat model thin controller)

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  /*    ({//we update the document need to save it(updating fields for the resettoken)
 must provide validate password before the save for that use this
 else error : "User validation failed: passwordConfirm: Please confirm password"})





  /* ({ 3) send token to user's email
-prapare the route (link )where the user will change the password and send it in the email
-send the email with the sendmail function with options object that return a promise that await for
-send a response with success for ending the req res cycle
}) */
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to : ${resetURL} if you didn't forget your password please ignore this email !`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email !',
    });
  } catch (error) {
    user.passwordRestToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError(
        'there is an error sending the email .try again later ! ',
        500
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log('params : ' + req.params.token);
  //decripti token
  //1get user base on the token  (if not exist throw error)
  //get expiration field and verify if token has expired or not
  //if not expirest update the password and recrypt it
  //log user in

  /* const user = await User.findOne({passwordRestToken : req.params.toString()})
  if(!user) return next( new appError(' user not found with this token ',404) )
  res.status(200).json({
    status: 'success',
    message: 'you get the user !',
  });*/
  //1-get user based on token(crypt token from email)
  //digest convertin to hexa
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  // 2-if token not expired && user exist =>set the new password
  const user = await User.findOne({ passwordRestToken: hashedToken ,passwordRestExpires : {$gt :Date.now()}})

  if (!user)
    return next(
      new appError(' user not found with this token or token expired ', 400)
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // 3-update changedPasswordAt property for the user
  // this in a middleware pre save    user.passwordChangedAt = Date.now()
  user.passwordRestToken = undefined;
  user.passwordRestExpires = undefined;
  await user.save();
  console.log('hello')
  /*//4-log the user in , send jwt //refactor with the createSendToken
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });*/
  createSendToken(user,200,res)
});

//this functionality is for login user
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1- get user from collection
  //this functionality for authenticated user from protected (the token is verified)(authenticted +autorized)
  console.log(req.user._id);
  const user = await User.findById( req.user._id).select('+password')



  //2-check for current pass  is correct
  const isCorrect =  await user.correctPassword (req.body.passwordCurrent,user.password)
  if(!isCorrect) return next(new appError('your current password is wrong',401))
  //3-update pass
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  //don't use update for password !!!
  // we don't use  findbyidadnupdate cause don't run validator in the passwordConfirm
  //cause the object is not keept in memorie
  // the pre save middelware that we used to crypt the password and the passwordchangedAt fields
  //these tow middelware will not run when  we don't use the save methode


  //4- log user in , send new jwt cause e of the new pass //refactor in the createSendToken

  createSendToken(user,200,res)


  /* const token  = signToken(user._id)
  res.status(200).json({
    status: 'success',
    message: 'you have updated your password successfully',
    token
  });*/
});
