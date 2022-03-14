

//class for create the err
class  appError extends  Error{
  constructor(message,statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status= `${statusCode}`.startsWith('4')?'fail':'error';
    this.isOperational = true ;
//this for knowing if it an operational error for
//other type of error this property will be false on them
Error.captureStackTrace(this,this.constructor)
  }

}
module.exports = appError
