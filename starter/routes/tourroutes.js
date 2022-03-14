const express = require('express');
const tourcontroller = require('./../controllers/tourcontroller');
const authController = require('./../controllers/authController');

const router = express.Router();

//call middelware for test if the id is valid in tour controller

//check id is in middelware not in handler function
///*** router.param('id',tourcontroller.checkid  )

//use middelware to take care of the access right and other stuff
//cheking id ....
//and make the handler take care of creating a ressources or update
//all the logic that not concern in ressources creating or geting or deleteing is in
//is happening in middelware

router.route('/tours-stats').get(tourcontroller.getTourStats);

router.route('/monthly-plan/:year').get(tourcontroller.getMonthPlan);

router
  .route('/top-5-cheap')
  .get(tourcontroller.cheapTour, tourcontroller.getalltour);
router
  .route('/top-5-best')
  .get(tourcontroller.bestTour, tourcontroller.getalltour);
router
  .route('/')
  .get(authController.protect, tourcontroller.getalltour)
  .post(/*tourcontroller.checkbody,*/ tourcontroller.createtour); //middelware and the routehandler
router
  .route('/:id')
  .get(tourcontroller.gettourbyid)
  .patch(tourcontroller.updatetour)
  .delete(
    authController.protect , authController.restrictTo('admin','lead-guide') ,
    tourcontroller.deletetour
  );

module.exports = router;
