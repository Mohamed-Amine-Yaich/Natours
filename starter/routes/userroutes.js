const express = require('express');
const usercontroller = require('./../controllers/usercontroller');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgetPassword);

router.patch('/updatemypassword', authController.protect,authController.updatePassword);

router
  .route('/')
  .get(usercontroller.getallusers)
  .post(usercontroller.createuser);
router
  .route('/:id')
  .get(usercontroller.getuserbyid)
  .patch(usercontroller.updateuser)
  .delete(usercontroller.deleteuser);

module.exports = router;
