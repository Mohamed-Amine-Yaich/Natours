const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync')
const appError = require('./../utils/appError')

//route handler
exports.getallusers = catchAsync(async (req, res,next) => {


      const users = await User.find()

      res.status(200).json({
          //format data to jsend data specification
          status: 200,

          data: {
              users,
          },
      });


  }
)

    exports.createuser = catchAsync(async (req, res,next) => {


          const user = await User.create(req.body)

          res.status(200).json({
              status: 'success',
              data: {
                  user
              },
          });


      }
    )
    exports.getuserbyid =catchAsync(async (req, res,next) => {


          const user = await User.findById(req.params.id)

          res.status(200).json({
              status: 'success',
              data: {
                  user
              },
          });


      }
    )
    exports.updateuser = catchAsync(async (req, res,next) => {


          const user = await User.findByIdAndUpdate(req.params.id,req.body,
            {new :true,runValidators : true})


          res.status(200).json({
              status: 'success',
              data: {
                  user
              },
          });


      }
    )
    exports.deleteuser = catchAsync(async (req, res,next) => {


          const user = await User.findByIdAndDelete(req.params.id)

          res.status(200).json({
              status: 'success',
              data:null
          });


      }
    )
