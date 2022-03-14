module.exports  = (fn) =>{
  return (req,res,next)=>{  fn( req,res,next).catch(err => next(err))
    //function retured assyned to the method  that express will call in route
  }

}
