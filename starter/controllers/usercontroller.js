const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el))  newObj[el]=obj[el]
  });
  return newObj;
};

//route handler
exports.getallusers = catchAsync(async (req, res, next) => {


    const users = await User.find();

    res.status(200).json({
      //format data to jsend data specification
      status: 200,
      length : users.length,
      data: {
        users
      }
    });


  }
);


//for log in user (protected)

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)error if user try to change password(post password)
  if (req.body.password || req.passwordConfirm) return next(new appError('this route not for password update use updateMyPassword', 400));
  //3) filtered out unwanted field names there are not allowed to be updated
  const filteredBody = filterObject(req.body, 'name', 'email');


  // 3)update user data
  //when dealing with non sensative data we can use findByIdAnd update car
  //save will run validator and we do not set a password

  const updatedUser = await User.findByIdAndUpdate(req.user._id,filteredBody, { new: true, runValidators: true }
    )
  ;

  console.log(updatedUser);
  res.status(200).json({
    status: 'success',
    data :{
      user :updatedUser
    }

  });

});


exports.deleteMe =catchAsync(async (req,res,next)=>{
  await  User.findByIdAndUpdate(req.user.id, {active : false })

  res.status(204).json({
    status:'success',
    message :'your account has been deleted',
    data :null
  })

})


exports.createuser = catchAsync(async (req, res, next) => {


    const user = await User.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });


  }
);
exports.getuserbyid = catchAsync(async (req, res, next) => {


    const user = await User.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });


  }
);
exports.updateuser = catchAsync(async (req, res, next) => {


    const user = await User.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true });


    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });


  }
);
exports.deleteuser = catchAsync(async (req, res, next) => {


    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      data: null
    });


  }
);
