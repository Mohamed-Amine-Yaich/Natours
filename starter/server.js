//starting file where we listen to ower server
//things that related to this app not express
//data base config
//error handling
//environnement variables
//this is file that we run

const mongoose = require('mongoose');
// install module from npm
const dotenv = require('dotenv');

// in unhandledExecption crushing the app is a must cause it is unclean state
// =>process need to terminate and restarted
process.on('uncaughtException', (err) => {
  console.log('uncaughtException !! shutting down...');
  console.log(
    'uncaught exception error name :' + err.name,
    'error message:' + err.message
  );
  console.log('err .stack from  uncaught execption listenner');
  console.log(err.stack);

  process.exit(1);
});

//applie the configuratin file(read command and save them in environment variables)
dotenv.config({ path: './config.env' }); //the config must be bfore the require of app
//the reading happen 1time and then the enviroment var are in the process
// the process is running where our app is running
//==> process.NODE_ENV is available in every file cause its the same app ,the same process
//cc:==>>envirment variables config is to run code in a specific mode

const app = require('./app');

//environment variables
//NODE_ENV : define the mode (product,development)

//=====>console.log(process.env);
// nodemon start to start the process
//NODE_ENV=development nodemon start (to change th mode ) this
//this code applie before the script code

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
const L_DB = process.env.LOCAL_DB;
mongoose.connect(L_DB).then(() => console.log('db connection successfull'));

const port = process.env.PORT || 3000; //port from the porcess.env or default
const server = app.listen(`${port}`, () => {
  console.log(`start listening ${port}`);
});

////////////need to catch these error in place dont relay on these to event listener(chaine catch method in the connection with data base
//event listener for handling promise rejection
//in unhandled rejection crushing app is optional
process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection !! shutting down...');
  console.log(err.name, err.message);
  console.log('err .stack from  unhandledRejection listenner');
  console.log(err.stack);
  //MongoServerError bad auth : Authentication failed
  //close the server bfore exit for ending the pening request
  server.close(() => {
    process.exit(1);
  });
});
