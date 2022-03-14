const appError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  //operational ,trusted error : send message to client (wrong route ,data)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //programming or other unknowing err (unspected error)
  else {
    // 1) log error
    console.error('ERROR not handled (not operational) :', err);
    //2)send generatec message
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong',
    });
  }
};
//iputted error from user(id,duplication, validation)
//handelcast error (invalid id)
const errorHandleCastErrorDB = (error) => {
  const message = `invalid ${error.path} : ${error.value} `;
  return new appError(message, 400);
};
//handelducplicated fields error
const handleDuplicationErrorDB = (error) => {
const value = error.message.match(/(["'])(\\?.)*?\1/)[0]
  console.log(value)
  const message = `Duplicated field value : ${value} please use another value`;
  return new appError(message, 400);
};
//handle validation error
const handleValidationErrorDB = (error)=>{
  const errors = Object.values(error.errors).map(el=>el.message)
  //object values for each invalid field object
  // then map all message of all object  in a table
const message = `invalid input data ${errors.join('. ')}`
  return  new appError(message,400)
}

//jwt verifying error
const handleJwtError=(error) => new appError('invalid token please log in again',401)
const handleExpiredJwtError= (error)=>new appError('token has expired! please log in again ',401)

//golal error handling middleware
module.exports = (err, req, res, next) => {
  //stack will show where the error happend
  /* console.log((' from stack :'))
  console.log(err.stack)
*/
  err.statusCode = err.statusCode || 500; //500 :bad server
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name ==='CastError') error = errorHandleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicationErrorDB(error)
    if(error.name==='ValidationError') error = handleValidationErrorDB(error);
    if(error.name==='JsonWebTokenError') error = handleJwtError()
    if(error.name==='TokenExpiredError') error = handleExpiredJwtError()

    //handel uncaught exeception that are in middelware :console.log(x)
//if (error.name == 'ReferenceError') .........complete with  kharmech
    sendErrorProd(error, res);
  }
};
