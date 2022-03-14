//no need for fs
//const fs = require('fs');
const Tour = require('./../model/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync')
const appError = require('./../utils/appError')

/*
//change the path
//var tours= JSON.parse( fs.readFileSync(`${__dirname}/dev-data/data/tours-simple`));
var tours= JSON.parse( fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple`));

//create middelware before the request reach hander function
//val is the value of params
exports.checkid = (req,res, next ,val)=>{
    console.log(`tour id is : ${val}`);
    if(req.params.id *1 > tours.length )
   return res.status(404).json({
     status : 'not found',
        message:'invalid'
    })
    next();
}

//middelware for testing the body of the request
exports.checkbody = (req,res, next )=>{
    console.log(`tour id is : ${val}`);
    if(!res.body.name ||!res.body.price)
   return res.status(400).json({
       status : 'fail',
        message:'missing name or price'
    })
    next();
}

*/

exports.bestTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,difficulty,summary';

  next();
};

exports.cheapTour = (req, res, next) => {
  //query set to strings
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  req.query.sort = 'price,ratingsAverage';

  next();
};

exports.getalltour = catchAsync(async (req, res,next) => {

    //2-execute query
    //must chaine all query in a single query and await them together
    //the sort methode executed on the result given by the filter method
    const features = new apiFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fields()
      .paging();

    //features.query containes all query from all the methodes chained ??
    const tours = await features.query;
    //3-send response
    res.status(200).json({
      //format data to jsend data specification
      status: 200,
      result: tours.length,
      data: {
        tours: tours,
      },
    });


}
)
exports.gettourbyid = catchAsync(async (req, res,next) => {
  /* //for params : obligatoire ?optional
    console.log(req.params)
    //console.log(tours[req.params.id])
    const id = req.parms.id*1
    const tour = tours.find(el=>el.id === id )
    if(!tour){
        res.status(404).json({
            status:'fail',
            message: 'invalid id'
        })
    }*/
  //////////
    const tour = await Tour.findById({ _id: req.params.id });
  if (!tour){
   return  next(new appError("no tour found with that ID",404))
  }
    res.status(200).json({
      status: 200,
      data: {
        tour,
      },
    });


  //format data to jsend data specification
})


//create the catchasync that take async function
 exports.createtour = catchAsync(async (req, res,next) => {
  //create a new object
  //const newtour = Tour({})
  //newtour.save
  //or simply use the model directly without creating instance :Tour.create({the prop of the object})
  //try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'sucess',
      data: {
        tour: newTour,
      },
    });
   /* }
    catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }*/
})

/* exports.createtour =  (req, res)=>{
    //for req we don't use the body of request to send data
    //use midelware to access to body prop in req
    console.log(req.body);

    //make an id for the new object
    const newId =tours[tours.lenght-1].id+1
    const newTour =Object.assign({id:newId},req.body)//merging two object
    tours.push(newTour)
    //update tours file
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple`,JSON.stringify(tours),(err)=>{
     //costume response 201
        res.status(201).json({
        status:'sucess',
        data:{
            tours:newTour
        }

    })
    })

} */

exports.updatetour = catchAsync(async (req, res,next) => {
  /*  const id = req.params.id*1
        const tour  = tours.fing(el=> el.id  === id)
     //if the id is valid and tour exist it will ignore this
        if(!tour){
            res.status(404).json({
                status:'fail',
                message: 'invalid id'
            })
        }
    */
  //update tour
  //respond with status and return the modified object


    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour){
    return  next(new appError("no tour found with that ID",404))
  }
    res.status(200).json({
      status: sucess,
      data: {
        tour: tour,
      },
    });

});
exports.deletetour = catchAsync(async (req, res,next) => {
  /*  const id = req.params.id*1
        const tour  = tours.fing(el=> el.id  === id)

        if(id > tours.lenght){
            res.status(204).json({
                status: 'not found',
                message : 'id invalid'
            })
        }
    */


   const tour =  await Tour.findByIdAndDelete({ _id: req.params.id });


  if (!tour){
    return  next(new appError("no tour found with that ID",404))
  }
    res.status(200).json({
      status: 'success',
      data: null,
    });

});
 
//const tour  = require('')
//21.aggregation pipeline
//is a mongo db feature
//aggregation pipe line define a pipeline that every document of a certain
//collection go throw in order to transform them to agregated result
//like a query
//manipulate data in steps(stages)
//the documents pass in different stages
// each stages is an object and begin with name of the stage
/*
* take document that match the query in the match stage
* pass those document to the second stage put them into groups according
* the id
*
* */
//to specifie the fields of document $fildname
//match:
//{$match:{query}
//group:
//{$group stage:{ fieldofstage : '$field of document'}}
//{$group stage : {field of stage : { $operator : '$field of document '

exports.getTourStats = catchAsync(async (req, res,next) => {


    const stats = await Tour.aggregate([
      {//{ $match: { <query> } } ,critere to chose docs
        $match: { price: {$lte : 3000}},
      },

      {
        $group: {
          _id:{$toUpper : '$difficulty'}, //calulate the stats of docs in same group
         //_id : '$ratingsAverage' //group according to difficulty or ratingsAverage
          numberOfTour: { $sum: 1 }, //sum of document throw agrigation pipeline
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage '}, //rating avg
          avgPrice: { $avg: '$price' }, //avg price of all tour
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {//in sorting specify filed name of the group stage
      $sort : {
        avgPrice : 1//sort by avgprice assending
      }
      },
     /* {//we can repate stages but this affect the data of groups
     //result is like a new document you can manipulate it as u like
        $match : { _id :{$ne:'EASY'}} /remove stats that have a difficulty easy
      }*/
    ]);


    res.status(200).json({
      status: 'success',
      data: stats,
    });

});


exports.getMonthPlan = catchAsync(async (req,res,next) =>{


    const year = req.params.year

    const monthlyPlan = await Tour.aggregate([
      {//deconstruct the array and affect a document for each array element
        $unwind : '$startDates'
      },{
      //take document that in the same year
        $match : { startDates: {$gte :new Date(`${year}-01-01`) ,$lte:new Date(`${year}-12-31`)}}
      }, {
        $group: { //make groups according the month
          _id: { $month: '$startDates' },
          numTourPerMonth: { $sum: 1 },
          toursName:{$push : '$name'},// name of tours in every month pushed in an array
          toursDuration : {$push : '$durationWeeks'},// virtuels not working
          toursPrice : {$push : '$price'}

        }
      },
      {//add field stage to replace the id fields with another field name with the same value

        $addFields : { month: '$_id'}
      },{//to remove fields 0 ,to appear 1
       $project : { _id : 0 }
      },
      { //stage to sort by the number of tours
        $sort : { numTourPerMonth : -1 }
      },
      {//show number of aggregated result according to the value(limit value)
        // and depending (number of docs)
        $limit :10//there are 10 agregated docs(result)  limt : 1 give the first one acording to the sort
      }
      ])



   res.status(200).json({
    status: 'success',
    monthlyPlan,
  });


})














/* const tours = await Tour.find()
      .where('duration')
      .equals(5)
      .where('difficulty')
      .equals('easy');
      *instade of equals use lte or gte
*/
//filter the query in request to remove 4 field of query from a queryobject
////////////////////
//API features in the get method
////////////////////
// 1 -built a query
/*
    const queryObject = { ...req.query };

    console.log('queryobject');
    console.log(queryObject);
 */
/*  //1-1/filtering
    //only remove some fields
    const excludedQuery = ['page', 'limit', 'sort', 'fields'];
    excludedQuery.forEach((element) => {
      delete queryObject[element];
    });
    console.log('queryobject:');
    console.log(queryObject);

    //await to work
    let queryV1 = Tour.find(queryObject);

    //1-2/advanced filtering

    let queryStr = JSON.stringify(queryObject);
    console.log('querystr:' + queryStr);
    //to persiste data from database  using filter object{duration :{$gte:5}}
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //callback take the match string and replace it wih $match string
    //replace operator in query with ($operator){"lte":"5"}=>{"$lte":"5"}
    //\b :to match to exact word (not a word containe letters of an operator)
    //g :to replace all operator if not exist replace only one
    const advQueryObject = JSON.parse(queryStr);
    console.log('querystr:');
    console.log(queryStr);

    console.log('advequeryobject :');
    console.log(advQueryObject);
    //await query to work
    let query = Tour.find(advQueryObject); */

//sorting
/*  if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join('  ');

      query = query.sort(sortBy);
    } else {
      query = query.sort('-price');
    }
    console.log('query after sort:' + query);
 */
//field limiting
//in  req.query the client specifiy filed that whant to see to exclude other
//you can exclude with the fie

//3/ fields
//get certain fields
/*  console.log('fields :');
    console.log(req.query);
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); // - to exclude this field from data that will be recived by the client
    } //this field is needed mongoose internaly can exclude them (never send to the client)// */

//4/ pagination and limit (page =2&limit=10)
//pagination used for an api with much data to allow user to get data in several pages
//use page and limit files in req.query for pagination
//data in a certain page the limit of data on it
//page is the number of the page
//limit is the number of object for a single page
//skip is the number of the object that we skip
//skip for knowning from which object

/*   const page = req.query.page * 1 || 1; //multiply to convert string to number and ||1 page 1 by default
    const limit = req.query.limit * 1 || 3;
    const skip = limit * (page - 1);
    query = query.skip(skip).limit(limit);

     if (skip >= (await Tour.countDocuments()))
      throw new Error('this page do not exist');
    if (req.query.page) {
      const tourNumber = await Tour.countDocuments();
      if (skip >= tourNumber) throw new Error('this page do not exist');
    }
    */
