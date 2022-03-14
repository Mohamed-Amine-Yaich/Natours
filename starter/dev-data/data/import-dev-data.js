const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../model/tourModel');

dotenv.config({ path: 'config.env' });

const L_DB = process.env.LOCAL_DB;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(L_DB)
  .then(() => console.log('db connected from import-dev-data'));

//read from jason file  :json.parse =>string json to a js object
//write  to a jason file stringify

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//import  in db
const importInDb = async () => {
  try {
    await Tour.create(tours); //create take an object or array of object
    console.log('data is successfully loaded in db');
    process.exit();
  } catch (err) {
    console.log('importindb err :' + err);
  }
};

//delete all data from the db
const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data is successfully deleded from db');
    process.exit();
  } catch (err) {
    console.log('delete data err :' + err);
  }
};
//argument du commande du terminal
//1st arg node  2nd arg dev-data/data/import-dev-data.js
console.log(
  'process.argv : node commande and the path of the file::' + process.argv
);

//check if the third argument in command(process.argv) to import data into db
//or delete it all
if (process.argv[2] == '--import') {
  importInDb();
} else if (process.argv[2] == '--delete') {
  deleteAllData();
}
