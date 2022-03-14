const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//in schema we pass an object for schema definition
// and other object for option (schema.virtual)

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name '],
    unique: true,
    //maxLength : 40,//if it false will show the built in message error
    //minLength:[5,'a tour name must have at least 5 charactars'],//specify the message on your own
   // validate: [validator.isAlpha,'name must containe only caracters']
//for string validation only
//require validator library in validator object contain different validator test
    //see method in validator github
  },
  ratingsAverage: {
    type: Number,
    //min:1,
    //max:[5,'you cant ']


  },
  duration: {
    type: Number,
    required: [true, 'a tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, ' a tour must have  a difficulty'],
    enum : {values:['easy','medium','difficult'],
    message : 'difficulty is either :easy, medium '
    }
    //the value of difficulty field must be one of the enum or ir run a validator error
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
  priceDiscount: {
    type : Number,
    validate :{
      validator :  function(val){
        return val < this.price ;
       //this refer to current document on creation of a NEW document(post method)
      //in update don't work

      },
      message: 'the priceDiscount {VALUE} must be less then the regular price of the tour'

    }
    //o
  },
  slug : String,


  summary: {
    type: String,
    trim: true,
    required: [true, 'a tour must have a discription'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String, //name of the image
    required: [true, 'a tour must have a cover image '],
  },
  images: [String], //the rest of image of the tour
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, //this field is not returned to the client
  },
  startDates: [Date], //different date for the same tour
  secretTour : {
    type : Boolean,
    default : false
  }
},{//every time data outputted as json send virtuals with data
  toJSON: { virtuals : true},
  toObject: { virtuals : true}


});
//define a virtual properties that not stored in db
//cant query virtual data cause is not part of db
//==> this conversion can done in controller but not a good practice
//(business logic(model) and app logic(controller) sparated ) /fat model and thin controllers

//but used when getting data from db
//for each object(document) take the duration(days) /7 for num of weeks

tourSchema.virtual('durationWeeks').get(function() {
return this.duration/7
})
//DOCUMENT middelware : runs before .save().create() not .insertmany,not update
//pre doc middel
//hook : save
tourSchema.pre('save',function(next) {
  //console.log("this from the doc middele    "+this)
//slug :field
  this.slug = slugify(this.name ,{lower:true })
next()
  //this refer to the document that been saved or created
})
/*
==>ref to document middelware in mongoose
tourSchema.pre('save',function(next) {
console.log("will save second middleware")
  next()
})

//post doc middelware
tourSchema.post('save', function(doc, next){
console.log('post doc midel'+ doc)


  next()
})*/

//===>QUERY MIDDLEWARE
//use regular expression for all query that contain find (find, findby..,findand..,..)
//this middelware will no langer show the secret tour for find querys
//we add a field to specify if tour is secret or not and use it in the find query
tourSchema.pre(/^find/, function(next) {
console.log("query middleware :"+this)
  this.find({ secretTour : {$ne:true}})
  //this.find({secretTour : false})
  this.start = Date.now()
next()
})
tourSchema.post(/^find/,function(doc,next){
  console.log(`qurey took ${Date.now() - this.start} milliseconds !` )
  console.log('docs after post find hooknd'+doc)
  next()
})


//AGGREGATION MIDDELWARE/
//secret tour can be found with the aggrengation pipe line
//must create another match stage for tour that have secret tour : false
//unshift to push and element in an array at first , shift at last
tourSchema.pre('aggregate', function(next) {
  console.log('this of  pre aggreagte hook :')
  this.pipeline().unshift({$match : {secretTour : {$ne : true}}})
  console.log(this)

  next()
})

//creating a model from the schema
const Tour = mongoose.model('Tour', tourSchema);
/* //crating a doc
const testTour = new Tour({
    name :"the forst hiker",
    rating :4.7,
    price:497
})
 */
module.exports = Tour;
