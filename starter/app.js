const fs = require('fs');
//require the module express//express function in app object
const express = require('express');
//const morgan = require('morgan');
//import error creation class
const appError = require('./utils/appError');
//import global handler from error contoller
const globalErrorHandler = require('./controllers/errorController');

//import router of user and tour (routes and routes handlers )
const tourRouter = require('./routes/tourroutes');
const userRouter = require('./routes/userroutes');

//you run  the server , use express function to
const app = express();

////////////////////////////://1)middelware
/*
if(process.env.NODE_ENV===development){//for the loggin happen in dev mode not in production
    app.use(morgan('dev')) }
*/
app.use(express.json()); //midelwhere/to pass data in the body of request
/*
//express.json() call a funtion that added to middelware stack
//middelware for static file
app.use(express.static(`${__dirname}/public/`))

*/
///middelware for test the header
app.use((req, res, next) => {
  console.log('show headers for jwt :');
  console.log(req.headers);

  next(); //to excute the next middelware
});

/*
//create own middelware app.use(nameof middelwarefunction) to add to middelware stack
//this need to place before the http methode to execute in each request
//if the we put it after the http methode it never executed because the cycle of req,res is closed
app.use((req, res, next)=>{
    console.log('hello from middelware')
    next();//to excute the next middelware
})
//2nd midd
app.use((req,res,next)=>{
    req.requestTime = new Date().toString();
    next();
})
*/

//get methode take the route and the route handler function (req,res)
/* app.get('/',(req,res)=>{
    res.status(200).send('you are get from the server')
})
app.post('/',(req,res)=>{
    res.send('you are posting in this route ')
}) */
/*
var tours= JSON.parse( fs.readFileSync(`${__dirname}/dev-data/data/tours-simple`));
*/

/////////////////////////////////2)route handler for get req

/////////////////////////////////////////////////////////3) route
//route(url ,end point) and route handler methode
/*app.get('/api/v1/tours',getalltour)
app.get('/api/v1/tours/:id',gettourbyid)
app.post('api/v1/tours' ,createtour)
app.patch('api/v1/tours/:id',updatetour)
app.delete('api/v1/tours/:id',deletetour)*/

// tour route or url and route handler (method) //replace

/* app.route('/api/v1/tours').get(getalltour).post(createtour)
app.route('/api/v1/tours/:id').get(gettourbyid).patch(updatetour).delete(deletetour)

app.route('/api/v1/users').get(getallusers).post(createuser)
app.route('/api/v1/users/:id').get(getuserbyid).patch(updateuser).delete(deleteuser) */

// user and tour router to put them in separate file

//create a middelware  with the this url
///mounting the router  :create a route and make it a middelware to spareate
///the router in separte file

//when user hit the url it pass to the middel that created in the same url
// the router or middelware will change to the correspond route depend on the method

//import tourrouter and make it a middelware
app.use('/api/v1/tours', tourRouter);

//make something happening between two event
//this is between two event app.route ()
// ==> app.use('middel', name ) //name.route().get
//imort userRouter and make it middelware
app.use('/api/v1/users', userRouter);

//this middelware to handel all request that not catch by the 2 middelwares up
//app.all(for all http request )/*for all path
//==>
/*app.all('*',(req,res,next)=>{
  res.status(404).json({
    status: 'fail',
    message :`can't find ${req.originalUrl} on this server`
    //the route that we give run in the
  })
})
*/
// creating error and send it with next method
/*app.all('*',(req,res,next)=>{
  const err = new Error( `can't find ${req.originalUrl} on this server`)
  err.statusCode = 404;
  err.status= 'fail';
  next(err);

})*/
//creating error object  with app error class
//pass the object error created with (message,statuscode) in the next method to be send to
//the global error handler middleware(error controller)
app.all('*', (req, res, next) => {
  //pass an instance or the appErr (passing an error)
  next(new appError(`can't find ${req.originalUrl} on this server`), 404);
});
//globle handler middleware
//=>placed in errircontroller

app.use(globalErrorHandler);

module.exports = app;
//4)start the server
//post or get data,also you specify the port
